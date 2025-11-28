import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
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

const prisma = new PrismaClient();

// Traditional Email/Password Registration
export const register = asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const { email, password, role } = validateRequest(registrationSchema, req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
        data: {
            email,
            passwordHash,
            role,
            isVerified: false
        }
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.session.create({
        data: {
            userId: user.id,
            refreshToken,
            expiresAt,
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip
        }
    });

    Logger.info('User registered successfully', { userId: user.id, email: user.email });

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
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
        where: { email }
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
                isVerified: user.isVerified
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
        // Create new user with wallet address
        user = await prisma.user.create({
            data: {
                walletAddress: normalizedAddress,
                role: 'COMPANY', // Default role, can be changed later
                nonce,
                nonceExpiry
            }
        });
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
