import { Request, Response } from 'express';
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
