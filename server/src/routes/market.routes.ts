import { Router } from 'express';
import { getMarketData, getChartData } from '../controllers/market.controller';

const router = Router();

router.get('/:projectId', getMarketData);
router.get('/:projectId/chart', getChartData);

export default router;
