import { Agent } from '@openserv-labs/sdk';
import { z } from 'zod';
import { OpenAI } from 'openai';
import newsService from '../services/news.service';
import prisma from '../db/client';
import { Logger } from '../utils/logger';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const marketMakerAgent = new Agent({
    systemPrompt: 'You are an autonomous Market Maker for the Carbon Credit ecosystem. Your goal is to maintain liquidity and price stability based on market news.'
});

marketMakerAgent.addCapability({
    name: 'assess_market_and_trade',
    description: 'Analyzes market news and current prices to execute buy/sell orders.',
    schema: z.object({
        // No arguments needed as it pulls fresh data
    }) as any,
    async run() {
        Logger.info('Market Maker: Starting assessment cycle...');

        // 1. Fetch News (Script-based, not LLM search)
        const news = await newsService.fetchMarketNews();
        if (news.length === 0) {
            return JSON.stringify({ action: 'HOLD', reason: 'No news found' });
        }

        // 2. Fetch Current Market Price
        // @ts-ignore
        const listings = await prisma.listing.findMany({ where: { status: 'ACTIVE' } });
        let currentPrice = 0;
        if (listings.length > 0) {
            const total = listings.reduce((sum: number, l: any) => sum + Number(l.price), 0);
            currentPrice = total / listings.length;
        } else {
            currentPrice = 10; // Baseline
        }

        // 3. Reasoning (LLM)
        const prompt = `
        Current Market Price: ${currentPrice} ETH
        
        Recent News:
        ${news.map(n => `- ${n.title} (${n.sentiment})`).join('\n')}
        
        Decide: BUY (Bullish), SELL (Bearish), or HOLD.
        Set Target Price.
        Output JSON: { "action": "BUY"|"SELL"|"HOLD", "targetPrice": number, "reasoning": "string" }
        `;

        const analysis = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                { role: "system", content: "You are a strategic market maker." },
                { role: "user", content: prompt }
            ]
        });

        const content = analysis.choices[0].message.content || '{}';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const decision = jsonMatch ? JSON.parse(jsonMatch[0]) : { action: 'HOLD', reasoning: 'Parse Error' };

        Logger.info('Market Maker Decision:', decision);

        // 4. Execution (Mocked for now, would call ContractService)
        if (decision.action === 'BUY') {
            // await contractService.buyListing(...)
        } else if (decision.action === 'SELL') {
            // await contractService.createListing(...)
        }

        return JSON.stringify(decision);
    }
});

export default marketMakerAgent;
