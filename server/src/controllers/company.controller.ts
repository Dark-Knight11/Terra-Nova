import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import {
    NotFoundError,
    AuthorizationError,
    ConflictError
} from '../middleware/errorHandler';
import {
    validateRequest,
    companyCreateSchema,
    companyUpdateSchema
} from '../utils/validation';
import { Logger } from '../utils/logger';

const prisma = new PrismaClient();

// Get all companies
export const getAllCompanies = asyncHandler(async (req: Request, res: Response) => {
    const { status, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (status) {
        where.verificationStatus = status;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [companies, total] = await Promise.all([
        prisma.company.findMany({
            where,
            skip,
            take: limitNum,
            include: {
                user: {
                    select: { email: true, walletAddress: true, isVerified: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.company.count({ where })
    ]);

    res.json({
        success: true,
        data: {
            companies,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        }
    });
});

// Get company by ID
export const getCompanyById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
        where: { id },
        include: {
            user: {
                select: { email: true, walletAddress: true, isVerified: true }
            }
        }
    });

    if (!company) {
        throw new NotFoundError('Company not found');
    }

    res.json({
        success: true,
        data: { company }
    });
});

// Get authenticated user's company profile
export const getMyCompany = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    const company = await prisma.company.findUnique({
        where: { userId },
        include: {
            user: {
                select: { email: true, walletAddress: true, isVerified: true }
            }
        }
    });

    if (!company) {
        throw new NotFoundError('Company profile not found');
    }

    res.json({
        success: true,
        data: { company }
    });
});

// Create company profile
export const createCompany = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
        throw new AuthorizationError('User not authenticated');
    }

    // Check if company already exists for this user
    const existingCompany = await prisma.company.findUnique({
        where: { userId }
    });

    if (existingCompany) {
        throw new ConflictError('Company profile already exists');
    }

    // Validate request body
    const data = validateRequest(companyCreateSchema, req.body);

    // Create company
    const company = await prisma.company.create({
        data: {
            ...data,
            userId
        },
        include: {
            user: {
                select: { email: true, walletAddress: true }
            }
        }
    });

    Logger.info('Company created', { companyId: company.id, userId });

    res.status(201).json({
        success: true,
        message: 'Company profile created successfully',
        data: { company }
    });
});

// Update company profile
export const updateCompany = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const company = await prisma.company.findUnique({
        where: { id }
    });

    if (!company) {
        throw new NotFoundError('Company not found');
    }

    // Only the owner or AUDITOR/REGISTRY can update
    if (company.userId !== userId && !['AUDITOR', 'REGISTRY'].includes(userRole || '')) {
        throw new AuthorizationError('You do not have permission to update this company');
    }

    // Validate request body
    const data = validateRequest(companyUpdateSchema, req.body);

    // Update company
    const updatedCompany = await prisma.company.update({
        where: { id },
        data,
        include: {
            user: {
                select: { email: true, walletAddress: true }
            }
        }
    });

    Logger.info('Company updated', { companyId: id, userId });

    res.json({
        success: true,
        message: 'Company updated successfully',
        data: { company: updatedCompany }
    });
});

// Delete company profile
export const deleteCompany = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    const company = await prisma.company.findUnique({
        where: { id }
    });

    if (!company) {
        throw new NotFoundError('Company not found');
    }

    // Only the owner can delete
    if (company.userId !== userId) {
        throw new AuthorizationError('You do not have permission to delete this company');
    }

    await prisma.company.delete({
        where: { id }
    });

    Logger.info('Company deleted', { companyId: id, userId });

    res.json({
        success: true,
        message: 'Company deleted successfully'
    });
});

// Verify company (AUDITOR/REGISTRY only)
export const verifyCompany = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body; // VERIFIED or REJECTED

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
        throw new Error('Invalid verification status');
    }

    const company = await prisma.company.update({
        where: { id },
        data: { verificationStatus: status },
        include: {
            user: {
                select: { email: true }
            }
        }
    });

    Logger.info('Company verification status updated', {
        companyId: id,
        status,
        verifiedBy: req.user?.userId
    });

    res.json({
        success: true,
        message: `Company ${status.toLowerCase()} successfully`,
        data: { company }
    });
});

// Link wallet address to company
export const linkWallet = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { walletAddress } = req.body;
    const userId = req.user?.userId;

    const company = await prisma.company.findUnique({
        where: { id }
    });

    if (!company) {
        throw new NotFoundError('Company not found');
    }

    // Only the owner can link wallet
    if (company.userId !== userId) {
        throw new AuthorizationError('You do not have permission to modify this company');
    }

    // Update company with wallet address
    const updatedCompany = await prisma.company.update({
        where: { id },
        data: { walletAddress }
    });

    Logger.info('Wallet linked to company', { companyId: id, walletAddress });

    res.json({
        success: true,
        message: 'Wallet linked successfully',
        data: { company: updatedCompany }
    });
});
