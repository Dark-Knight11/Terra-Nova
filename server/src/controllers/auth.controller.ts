import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { SiweMessage } from 'siwe';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt';
import {
    validateRequest,
    registrationSchema,
    loginSchema,
    siweVerificationSchema
} from '../utils/validation';
import {
    asyncHandler
} from '../middleware/errorHandler';
import {
    AuthenticationError,
    ConflictError,
    NotFoundError,
    ValidationError
} from '../middleware/errorHandler';
import web3Service from '../services/web3.service';
import { Logger } from '../utils/logger';
import { prisma } from '../db/client';

// Traditional Email/Password Registration
export const register = asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const { email, password, role, companyName } = validateRequest(registrationSchema, req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Use transaction to create user and related entity
    const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
            data: {
                email,
                passwordHash,
                role,
                isVerified: false
            },
            include: {
                company: true,
                auditor: true,
                registry: true
            }
        });

        // Create related entity based on role
        if (role === 'COMPANY' && companyName) {
            await tx.company.create({
                data: {
                    userId: user.id,
                    name: companyName,
                    verificationStatus: 'PENDING'
                }
            });
        } else if (role === 'AUDITOR') {
            // Create placeholder auditor profile
            await tx.auditor.create({
                data: {
                    userId: user.id,
                    name: email.split('@')[0], // Default name from email
                    verificationStatus: 'PENDING'
                }
            });
        } else if (role === 'REGISTRY') {
            // Create placeholder registry profile
            await tx.registry.create({
                data: {
                    userId: user.id,
                    name: email.split('@')[0], // Default name from email
                    verificationStatus: 'PENDING'
                }
            });
        }

        return user;
    });

    // Generate tokens
    const accessToken = generateAccessToken(result.id, result.role);
    const refreshToken = generateRefreshToken(result.id);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.session.create({
        data: {
            userId: result.id,
            refreshToken,
            expiresAt,
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip
        }
    });

    Logger.info('User registered successfully', { userId: result.id, email: result.email });

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            user: {
                id: result.id,
                email: result.email,
                role: result.role,
                isVerified: result.isVerified,
                company: (result as any).company,
                auditor: (result as any).auditor,
                registry: (result as any).registry
            },
            accessToken,
            refreshToken
        }
    });
});

// Traditional Email/Password Login
export const login = asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const { email, password } = validateRequest(loginSchema, req.body);

    // Find user
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            company: true,
            auditor: true,
            registry: true
        }
    });

    if (!user || !user.passwordHash) {
        throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.session.create({
        data: {
            userId: user.id,
            refreshToken,
            expiresAt,
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip
        }
    });

    Logger.info('User logged in successfully', { userId: user.id, email: user.email });

    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                company: user.company,
                auditor: user.auditor,
                registry: user.registry
            },
            accessToken,
            refreshToken
        }
    });
});

// Get Nonce for Web3 Authentication
export const getNonce = asyncHandler(async (req: Request, res: Response) => {
    const { address } = req.params;

    // Validate wallet address
    if (!web3Service.verifyWalletAddress(address)) {
        throw new ValidationError('Invalid Ethereum wallet address');
    }

    const normalizedAddress = web3Service.normalizeAddress(address);

    // Generate nonce
    const nonce = crypto.randomBytes(32).toString('hex');
    const nonceExpiry = new Date(Date.now() + parseInt(process.env.NONCE_EXPIRATION_MS || '600000'));

    // Find or create user
    let user = await prisma.user.findUnique({
        where: { walletAddress: normalizedAddress }
    });

    if (!user) {
        // Check if we are linking to an authenticated user (via auth middleware)
        // Note: This endpoint is usually public, but if we want to support linking, we might need a separate flow or check auth header

        // For now, standard flow: Create new user if not exists (only for wallet-first auth, which we are deprecating for signup but keeping for login)
        // But per requirements, we want strict input-based signup. 
        // So if user doesn't exist, we shouldn't create one here blindly if we want to enforce email signup first.
        // However, for "Login with Wallet", we need to support existing users.

        // If user doesn't exist, we return 404 or handle it. 
        // But wait, the requirement is "keep login strictly input based and give option to later connect metamask".
        // So "Login with Wallet" might only be for users who HAVE linked their wallet.

        // If we want to allow "Login with Wallet" for users who have already linked, we return 404 if not found.
        // If we want to allow "Sign up with Wallet" (which we are removing), we would create.

        // Let's assume we ONLY allow getting nonce for existing users with that wallet.
        // OR for a new wallet that is being linked to an authenticated user.

        // Since this is a public endpoint, we can't easily know the authenticated user without middleware.
        // Let's keep it as is for now but maybe restrict creation?
        // Actually, for "Link Wallet", we will use a separate protected endpoint.
        // This `getNonce` is for the public "Login with Wallet" flow.

        // If user not found by wallet, we can create a temporary record OR just return error.
        // Given the new requirement, let's NOT create a new user here.
        // But we need to support the case where a user IS trying to login with a wallet they already linked.

        // So:
        // 1. If user exists with this wallet -> Return nonce.
        // 2. If user does NOT exist -> Return error "Wallet not registered. Please sign up with email first."

        throw new NotFoundError('Wallet not registered. Please sign up with email first, then link your wallet in settings.');
    } else {
        // Update nonce for existing user
        user = await prisma.user.update({
            where: { id: user.id },
            data: { nonce, nonceExpiry }
        });
    }

    // Create SIWE message
    const domain = process.env.SIWE_DOMAIN || 'localhost:3001';
    const uri = process.env.SIWE_URI || 'http://localhost:3001';
    const chainId = parseInt(process.env.ETHEREUM_CHAIN_ID || '1');

    const message = new SiweMessage({
        domain,
        address: normalizedAddress,
        statement: 'Sign in to DCCP - Decentralized Carbon Credit Platform',
        uri,
        version: '1',
        chainId,
        nonce
    });

    Logger.info('Nonce generated for wallet', { address: normalizedAddress });

    res.json({
        success: true,
        data: {
            nonce,
            message: message.prepareMessage()
        }
    });
});

// Verify SIWE Signature
export const verifySignature = asyncHandler(async (req: Request, res: Response) => {
    const { message, signature } = validateRequest(siweVerificationSchema, req.body);

    // Parse SIWE message
    const siweMessage = new SiweMessage(message);

    // Verify signature
    try {
        await siweMessage.verify({ signature });
    } catch (error) {
        Logger.error('SIWE verification failed', { error });
        throw new AuthenticationError('Invalid signature');
    }

    const normalizedAddress = web3Service.normalizeAddress(siweMessage.address);

    // Find user by wallet address
    const user = await prisma.user.findUnique({
        where: { walletAddress: normalizedAddress }
    });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    // Verify nonce
    if (user.nonce !== siweMessage.nonce) {
        throw new AuthenticationError('Invalid nonce');
    }

    // Check nonce expiry
    if (user.nonceExpiry && user.nonceExpiry < new Date()) {
        throw new AuthenticationError('Nonce expired');
    }

    // Invalidate nonce immediately
    await prisma.user.update({
        where: { id: user.id },
        data: { nonce: null, nonceExpiry: null }
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.session.create({
        data: {
            userId: user.id,
            refreshToken,
            expiresAt,
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip
        }
    });

    Logger.info('Web3 authentication successful', { userId: user.id, walletAddress: normalizedAddress });

    res.json({
        success: true,
        message: 'Authentication successful',
        data: {
            user: {
                id: user.id,
                walletAddress: user.walletAddress,
                role: user.role,
                isVerified: user.isVerified
            },
            accessToken,
            refreshToken
        }
    });
});

// Link Wallet to Existing Account
export const linkWallet = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { message, signature } = validateRequest(siweVerificationSchema, req.body);

    if (!userId) {
        throw new AuthenticationError('Not authenticated');
    }

    // Parse SIWE message
    const siweMessage = new SiweMessage(message);

    // Verify signature
    try {
        await siweMessage.verify({ signature });
    } catch (error) {
        Logger.error('SIWE verification failed', { error });
        throw new AuthenticationError('Invalid signature');
    }

    const normalizedAddress = web3Service.normalizeAddress(siweMessage.address);

    // Check if wallet is already linked to another user
    const existingWalletUser = await prisma.user.findUnique({
        where: { walletAddress: normalizedAddress }
    });

    if (existingWalletUser && existingWalletUser.id !== userId) {
        throw new ConflictError('Wallet already linked to another account');
    }

    // Get current user to check nonce
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    // Verify nonce (User should have requested a nonce before calling this)
    // Note: For linking, we need a way to generate a nonce for the AUTHENTICATED user.
    // We can reuse getNonce if we allow it to update the user's nonce even if wallet doesn't match yet?
    // Or we need a specific "getNonceForLinking" endpoint?
    // Simpler: The frontend requests a nonce for the WALLET address. 
    // But wait, getNonce currently looks up by WALLET address.
    // If the wallet is not linked, getNonce throws NotFoundError (as per my change above).

    // So we need to fix getNonce to allow generating a nonce for a wallet that ISN'T linked yet, 
    // IF the intention is to link it. But getNonce is public.

    // Solution: Add a specific `getLinkingNonce` endpoint or modify `getNonce` to handle this case.
    // Or, simpler: `linkWallet` endpoint handles the nonce verification differently? 
    // No, SIWE requires a nonce from the backend.

    // Let's modify `getNonce` to allow creating a temporary nonce record? No, that's complex.
    // Best approach: 
    // 1. Authenticated user calls `generate-nonce` (new endpoint) which sets a nonce on their USER record.
    // 2. User signs message with that nonce.
    // 3. User calls `linkWallet` with signature.

    // But SIWE message includes the address. The signature verifies that the address signed the message containing the nonce.
    // So the nonce must be associated with the user who is initiating the link.

    if (user.nonce !== siweMessage.nonce) {
        throw new AuthenticationError('Invalid nonce');
    }

    // Update user with new wallet address
    await prisma.user.update({
        where: { id: userId },
        data: {
            walletAddress: normalizedAddress,
            nonce: null,
            nonceExpiry: null
        }
    });

    // Also update the entity record (Company/Auditor/Registry)
    if (user.role === 'COMPANY') {
        await prisma.company.update({
            where: { userId },
            data: { walletAddress: normalizedAddress }
        });
    } else if (user.role === 'AUDITOR') {
        await prisma.auditor.update({
            where: { userId },
            data: { walletAddress: normalizedAddress }
        });
    } else if (user.role === 'REGISTRY') {
        await prisma.registry.update({
            where: { userId },
            data: { walletAddress: normalizedAddress }
        });
    }

    Logger.info('Wallet linked successfully', { userId, walletAddress: normalizedAddress });

    res.json({
        success: true,
        message: 'Wallet linked successfully',
        data: {
            walletAddress: normalizedAddress
        }
    });
});

// Generate Nonce for Linking (Authenticated)
export const generateLinkingNonce = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { address } = req.params;

    if (!userId) {
        throw new AuthenticationError('Not authenticated');
    }

    const normalizedAddress = web3Service.normalizeAddress(address);

    // Generate nonce
    const nonce = crypto.randomBytes(32).toString('hex');
    const nonceExpiry = new Date(Date.now() + parseInt(process.env.NONCE_EXPIRATION_MS || '600000'));

    // Update user with nonce
    await prisma.user.update({
        where: { id: userId },
        data: { nonce, nonceExpiry }
    });

    // Create SIWE message
    const domain = process.env.SIWE_DOMAIN || 'localhost:3001';
    const uri = process.env.SIWE_URI || 'http://localhost:3001';
    const chainId = parseInt(process.env.ETHEREUM_CHAIN_ID || '1');

    const message = new SiweMessage({
        domain,
        address: normalizedAddress,
        statement: 'Link wallet to DCCP Account',
        uri,
        version: '1',
        chainId,
        nonce
    });

    res.json({
        success: true,
        data: {
            nonce,
            message: message.prepareMessage()
        }
    });
});

// Refresh Access Token
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken: token } = req.body;

    if (!token) {
        throw new AuthenticationError('Refresh token required');
    }

    // Verify token
    const payload = verifyToken(token);

    if (payload.type !== 'refresh') {
        throw new AuthenticationError('Invalid token type');
    }

    // Check if session exists and is valid
    const session = await prisma.session.findUnique({
        where: { refreshToken: token },
        include: { user: true }
    });

    if (!session) {
        throw new AuthenticationError('Invalid refresh token');
    }

    if (session.expiresAt < new Date()) {
        // Delete expired session
        await prisma.session.delete({
            where: { id: session.id }
        });
        throw new AuthenticationError('Refresh token expired');
    }

    // Generate new access token
    const accessToken = generateAccessToken(session.user.id, session.user.role);

    Logger.info('Access token refreshed', { userId: session.user.id });

    res.json({
        success: true,
        data: { accessToken }
    });
});

// Logout
export const logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken: token } = req.body;

    if (token) {
        // Delete session
        await prisma.session.deleteMany({
            where: { refreshToken: token }
        });
    }

    Logger.info('User logged out');

    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// Get current user info
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
        throw new AuthenticationError('Not authenticated');
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            walletAddress: true,
            role: true,
            isVerified: true,
            createdAt: true,
            company: true,
            auditor: true,
            registry: true
        }
    });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    res.json({
        success: true,
        data: { user }
    });
});
