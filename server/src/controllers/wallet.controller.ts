import { Request, Response } from 'express';
import { prisma, withRLS } from '../db/client';
import {
    asyncHandler,
    NotFoundError,
    AuthorizationError,
    ConflictError,
    ValidationError
} from '../middleware/errorHandler';
import { Logger } from '../utils/logger';
import { SiweMessage } from 'siwe';
import web3Service from '../services/web3.service';
import * as crypto from 'crypto';

// Get all wallets (Public)
export const getWallets = asyncHandler(async (req: Request, res: Response) => {
    const { status, minScore, limit } = req.query;

    const where: any = {};

    if (status) where.status = status;
    if (minScore) where.score = { gte: Number(minScore) };

    const wallets = await prisma.wallet.findMany({
        where,
        orderBy: { score: 'desc' },
        take: limit ? Number(limit) : undefined,
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true
                }
            }
        }
    });

    res.json({
        success: true,
        data: wallets
    });
});

// Get wallet by address (Public)
export const getWalletByAddress = asyncHandler(async (req: Request, res: Response) => {
    const { address } = req.params;

    const wallet = await prisma.wallet.findUnique({
        where: { walletAddress: address },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    company: true,
                    auditor: true,
                    registry: true
                }
            }
        }
    });

    if (!wallet) {
        throw new NotFoundError('Wallet not found');
    }

    res.json({
        success: true,
        data: wallet
    });
});

// Register wallet (Protected)
export const registerWallet = asyncHandler(async (req: Request, res: Response) => {
    const { walletAddress, entity, volume } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
        throw new AuthorizationError('Not authenticated');
    }

    // Check if wallet already exists
    const existingWallet = await prisma.wallet.findUnique({
        where: { walletAddress }
    });

    if (existingWallet) {
        throw new ConflictError('Wallet already registered');
    }

    // Calculate initial score (mock logic)
    const score = Math.floor(Math.random() * 200) + 600; // 600-800

    const wallet = await prisma.wallet.create({
        data: {
            walletAddress,
            userId,
            entity,
            volume: String(volume),
            score,
            status: 'PENDING'
        }
    });

    Logger.info('Wallet registered', { walletAddress, userId });

    res.status(201).json({
        success: true,
        data: wallet
    });
});

// Update wallet status (Protected - Registry only)
export const updateWalletStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
        throw new AuthorizationError('Not authenticated');
    }

    if (userRole !== 'REGISTRY') {
        throw new AuthorizationError('Only Registry can verify wallets');
    }

    const updatedWallet = await withRLS(userId, userRole, async (tx) => {
        return await tx.wallet.update({
            where: { id },
            data: { status }
        });
    });

    Logger.info('Wallet status updated', { walletId: id, status });

    res.json({
        success: true,
        data: updatedWallet
    });
});

// Generate nonce for wallet linking
export const generateLinkNonce = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    
    if (!userId) {
        throw new AuthorizationError('Not authenticated');
    }

    // Generate nonce
    const nonce = crypto.randomBytes(32).toString('hex');
    const nonceExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user with nonce
    await prisma.user.update({
        where: { id: userId },
        data: { nonce, nonceExpiry }
    });

    res.json({
        success: true,
        data: { nonce }
    });
});

// Link wallet to user account
export const linkWallet = asyncHandler(async (req: Request, res: Response) => {
    const { message, signature } = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
        throw new AuthorizationError('Not authenticated');
    }

    // Parse SIWE message
    let siweMessage;
    try {
        siweMessage = new SiweMessage(message);
        await siweMessage.verify({ signature });
    } catch (error) {
        Logger.error('SIWE verification failed', { error });
        throw new ValidationError('Invalid signature');
    }

    const walletAddress = web3Service.normalizeAddress(siweMessage.address);

    // Check if wallet is already linked to another user
    const existingWallet = await prisma.user.findFirst({
        where: { walletAddress }
    });

    if (existingWallet && existingWallet.id !== userId) {
        throw new ConflictError('This wallet is already linked to another account');
    }

    // Update user with new wallet address
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { 
            walletAddress,
            nonce: null,
            nonceExpiry: null 
        },
        select: {
            id: true,
            email: true,
            walletAddress: true,
            role: true
        }
    });

    // Also update the wallet in the wallets table
    await prisma.wallet.upsert({
        where: { walletAddress },
        update: { userId },
        create: {
            walletAddress,
            userId,
            entity: userRole,
            volume: '0',
            score: 600, // Default score
            status: 'PENDING'
        }
    });

    Logger.info('Wallet linked successfully', { userId, walletAddress });

    res.json({
        success: true,
        message: 'Wallet linked successfully',
        data: {
            user: updatedUser
        }
    });
});
