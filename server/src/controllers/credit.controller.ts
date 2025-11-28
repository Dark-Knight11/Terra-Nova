import { Request, Response } from 'express';
import { prisma, withRLS } from '../db/client';
import {
    asyncHandler,
    NotFoundError,
    AuthorizationError
} from '../middleware/errorHandler';
import { Logger } from '../utils/logger';

// Get all credits (Public)
export const getCredits = asyncHandler(async (req: Request, res: Response) => {
    const { type, minPrice, maxPrice, minScore, location, limit } = req.query;

    const where: any = {};

    if (type) where.type = type;
    if (location) where.location = { contains: String(location), mode: 'insensitive' };
    if (minScore) where.score = { gte: Number(minScore) };

    if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = Number(minPrice);
        if (maxPrice) where.price.lte = Number(maxPrice);
    }

    const credits = await prisma.carbonCredit.findMany({
        where,
        include: {
            company: {
                select: {
                    name: true,
                    verificationStatus: true
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: limit ? Number(limit) : undefined
    });

    res.json({
        success: true,
        data: credits
    });
});

// Get credit by ID (Public)
export const getCreditById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const credit = await prisma.carbonCredit.findUnique({
        where: { id },
        include: {
            company: {
                select: {
                    name: true,
                    verificationStatus: true,
                    description: true,
                    country: true
                }
            }
        }
    });

    if (!credit) {
        throw new NotFoundError('Carbon credit not found');
    }

    res.json({
        success: true,
        data: credit
    });
});

// Create credit (Protected - Company only)
export const createCredit = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
        throw new AuthorizationError('Not authenticated');
    }

    // Use RLS helper to ensure policy enforcement
    const credit = await withRLS(userId, userRole, async (tx) => {
        // First check if user has a company profile
        const company = await tx.company.findUnique({
            where: { userId }
        });

        if (!company) {
            throw new AuthorizationError('Company profile required to list credits');
        }

        const {
            title,
            type,
            price,
            location,
            image,
            description,
            vintage,
            volume,
            methodology
        } = req.body;

        return await tx.carbonCredit.create({
            data: {
                title,
                type,
                price,
                location,
                image,
                description,
                vintage,
                volume,
                methodology,
                companyId: company.id,
                companyName: company.name,
                score: 0 // Default score
            }
        });
    });

    res.status(201).json({
        success: true,
        data: credit
    });
});

/**
 * Update a carbon credit
 */
export const updateCredit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const credit = await prisma.carbonCredit.update({
            where: { id },
            data: updateData
        });

        Logger.info('Carbon credit updated', { creditId: id });

        res.json({
            success: true,
            data: credit
        });
    } catch (error: any) {
        Logger.error('Error updating carbon credit', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to update carbon credit',
            error: error.message
        });
    }
};

/**
 * Delete a carbon credit
 */
export const deleteCredit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.carbonCredit.delete({
            where: { id }
        });

        Logger.info('Carbon credit deleted', { creditId: id });

        res.json({
            success: true,
            message: 'Carbon credit deleted successfully'
        });
    } catch (error: any) {
        Logger.error('Error deleting carbon credit', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to delete carbon credit',
            error: error.message
        });
    }
};
