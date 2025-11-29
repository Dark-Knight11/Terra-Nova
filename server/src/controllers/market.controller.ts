import { Request, Response } from 'express';
import { ethers } from 'ethers';
import prisma from '../db/client';
import { asyncHandler } from '../middleware/errorHandler';

export const getMarketData = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;

    // @ts-ignore
    const listings = await prisma.listing.findMany({
        where: {
            projectId: projectId,
            status: 'ACTIVE'
        },
        orderBy: {
            price: 'asc'
        }
    });

    // @ts-ignore
    const trades = await prisma.trade.findMany({
        where: {
            projectId: projectId
        },
        orderBy: {
            timestamp: 'desc'
        },
        take: 50
    });

    res.json({
        listings,
        trades
    });
});

export const getChartData = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    // const { timeframe } = req.query; // e.g., '1d', '1w' - for now just return all trades

    // @ts-ignore
    const trades = await prisma.trade.findMany({
        where: {
            projectId: projectId
        },
        orderBy: {
            timestamp: 'asc'
        }
    });

    // Simple aggregation could be done here if needed, but for now sending raw trades
    // Frontend can aggregate into candles
    res.json(trades);
});

export const getListings = asyncHandler(async (_req: Request, res: Response) => {
    // @ts-ignore
    const listings = await prisma.listing.findMany({
        where: {
            status: 'ACTIVE'
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    if (listings.length === 0) {
        return res.json({
            success: true,
            data: []
        });
    }

    // Get unique project IDs
    const projectIds = [...new Set(listings.map((l: any) => l.projectId))];

    // Fetch credits
    // @ts-ignore
    const credits = await prisma.carbonCredit.findMany({
        where: {
            projectId: { in: projectIds }
        },
        include: {
            company: true
        }
    });

    // Merge data
    const result = listings.map((listing: any) => {
        const credit = credits.find((c: any) => c.projectId === listing.projectId);
        if (!credit) return null;

        // Convert Wei to Ether for display
        let priceDisplay = listing.price;
        try {
            priceDisplay = ethers.formatUnits(listing.price, 18);
        } catch (e) {
            console.error('Error formatting price:', e);
        }

        return {
            ...credit, // Base credit details
            id: listing.listingId, // Override ID with listing ID for unique key
            originalCreditId: credit.id,
            price: priceDisplay, // Display price
            amount: listing.amount, // Available amount
            listing: listing
        };
    }).filter(Boolean);

    res.json({
        success: true,
        data: result
    });
});
