import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import contractService from '../services/contract.service';
import web3Service from '../services/web3.service';

// Get credit balance for a wallet address
export const getCreditBalance = asyncHandler(async (req: Request, res: Response) => {
    const { address } = req.params;

    // Verify address format
    if (!web3Service.verifyWalletAddress(address)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid wallet address'
        });
    }

    const balance = await contractService.getCreditBalance(address);

    res.json({
        success: true,
        data: {
            address,
            balance
        }
    });
});

// Get project details from blockchain
export const getProjectDetails = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const projectId = parseInt(id);

    if (isNaN(projectId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid project ID'
        });
    }

    const project = await contractService.getProjectDetails(projectId);

    if (!project) {
        return res.status(404).json({
            success: false,
            message: 'Project not found on blockchain'
        });
    }

    res.json({
        success: true,
        data: { project }
    });
});

// Verify transaction
export const verifyTransaction = asyncHandler(async (req: Request, res: Response) => {
    const { txHash } = req.body;

    if (!txHash || typeof txHash !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Transaction hash required'
        });
    }

    const result = await contractService.verifyTransaction(txHash);

    res.json({
        success: true,
        data: result
    });
});

// Get recent blockchain events (placeholder - would need implementation based on requirements)
export const getRecentEvents = asyncHandler(async (_req: Request, res: Response) => {
    // This would require storing events in database or querying from blockchain
    // For now, return empty array
    res.json({
        success: true,
        data: {
            events: [],
            message: 'Event tracking not yet implemented'
        }
    });
});
