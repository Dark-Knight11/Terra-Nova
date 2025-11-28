import { Logger } from '../utils/logger';

export interface NewsItem {
    title: string;
    summary: string;
    source: string;
    timestamp: Date;
    sentiment?: 'positive' | 'negative' | 'neutral'; // Optional pre-labeled sentiment
}

class NewsService {
    // Mock news data for simulation
    private mockNews: NewsItem[] = [
        {
            title: "Global Carbon Prices Surge as New Regulations Loom",
            summary: "Major economies are tightening emission caps, leading to a spike in demand for voluntary carbon credits.",
            source: "CarbonPulse",
            timestamp: new Date(),
            sentiment: 'positive'
        },
        {
            title: "Tech Giant Announces Massive Carbon Offset Purchase",
            summary: "A leading tech company has committed to offsetting 100% of its historical emissions, driving up market activity.",
            source: "GreenTech",
            timestamp: new Date(),
            sentiment: 'positive'
        },
        {
            title: "Concerns Raised Over Quality of Some Reforestation Projects",
            summary: "Auditors have flagged inconsistencies in several large-scale reforestation projects, causing a temporary dip in confidence.",
            source: "EcoWatch",
            timestamp: new Date(),
            sentiment: 'negative'
        },
        {
            title: "Market Stabilizes After Volatile Week",
            summary: "Trading volume has normalized after last week's policy announcements.",
            source: "MarketWatch",
            timestamp: new Date(),
            sentiment: 'neutral'
        }
    ];

    async fetchMarketNews(): Promise<NewsItem[]> {
        Logger.info('Fetching market news...');

        // In a real implementation, we would fetch from an API like NewsAPI or RSS feeds
        // const response = await axios.get('https://newsapi.org/v2/everything?q=carbon+credits');

        // For now, return a random subset of mock news to simulate changing conditions
        const count = Math.floor(Math.random() * 2) + 1; // 1 or 2 items
        const shuffled = this.mockNews.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, count);

        Logger.info(`Fetched ${selected.length} news items`);
        return selected;
    }
}

export default new NewsService();
