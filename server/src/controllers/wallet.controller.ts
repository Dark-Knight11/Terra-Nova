import { Request, Response } from 'express';
import { prisma, withRLS } from '../db/client';
import {
    asyncHandler,
    NotFoundError,
    AuthorizationError,
    ConflictError
} from '../middleware/errorHandler';
import { Logger } from '../utils/logger';

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
