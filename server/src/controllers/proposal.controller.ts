import { Request, Response } from 'express';
import { prisma, withRLS } from '../db/client';
import {
    asyncHandler,
    NotFoundError,
    AuthorizationError
} from '../middleware/errorHandler';
import { Logger } from '../utils/logger';

// Get all proposals (Public)
export const getProposals = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.query;

    const where: any = {};
    if (status) where.status = status;

    const proposals = await prisma.proposal.findMany({
        where,
        orderBy: { createdAt: 'desc' }
    });

    res.json({
        success: true,
        data: proposals
    });
});

// Get proposal by ID (Public)
export const getProposalById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const proposal = await prisma.proposal.findUnique({
        where: { id }
    });

    if (!proposal) {
        throw new NotFoundError('Proposal not found');
    }

    res.json({
        success: true,
        data: proposal
    });
});

// Create proposal (Protected - Registry only)
export const createProposal = asyncHandler(async (req: Request, res: Response) => {
    const { title, description, endDate } = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
        throw new AuthorizationError('Not authenticated');
    }

    if (userRole !== 'REGISTRY') {
        throw new AuthorizationError('Only Registry can create proposals');
    }

    const proposal = await withRLS(userId, userRole, async (tx) => {
        return await tx.proposal.create({
            data: {
                title,
                description,
                endDate: endDate ? new Date(endDate) : undefined,
                status: 'ACTIVE'
            }
        });
    });

    res.status(201).json({
        success: true,
        data: proposal
    });
});

/**
 * Vote on a proposal (authenticated)
 */
export const voteOnProposal = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { vote } = req.body; // 'for' or 'against'

        if (vote !== 'for' && vote !== 'against') {
            return res.status(400).json({
                success: false,
                message: 'Vote must be either "for" or "against"'
            });
        }

        const proposal = await prisma.proposal.findUnique({
            where: { id }
        });

        if (!proposal) {
            return res.status(404).json({
                success: false,
                message: 'Proposal not found'
            });
        }

        if (proposal.status !== 'ACTIVE') {
            return res.status(400).json({
                success: false,
                message: 'Proposal is not active'
            });
        }

        const updatedProposal = await prisma.proposal.update({
            where: { id },
            data: {
                votesFor: vote === 'for' ? proposal.votesFor + 1 : proposal.votesFor,
                votesAgainst: vote === 'against' ? proposal.votesAgainst + 1 : proposal.votesAgainst
            }
        });

        Logger.info('Vote cast on proposal', { proposalId: id, vote });

        res.json({
            success: true,
            data: updatedProposal
        });
    } catch (error: any) {
        Logger.error('Error voting on proposal', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to vote on proposal',
            error: error.message
        });
    }
};

/**
 * Update a proposal (authenticated)
 */
export const updateProposal = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Don't allow direct vote manipulation
        delete updateData.votesFor;
        delete updateData.votesAgainst;

        const proposal = await prisma.proposal.update({
            where: { id },
            data: updateData
        });

        Logger.info('Proposal updated', { proposalId: id });

        res.json({
            success: true,
            data: proposal
        });
    } catch (error: any) {
        Logger.error('Error updating proposal', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to update proposal',
            error: error.message
        });
    }
};
