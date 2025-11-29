import { Router } from 'express';
import { getMarketData, getChartData, getListings } from '../controllers/market.controller';

const router = Router();

router.get('/', getListings);
router.get('/:projectId', getMarketData);
router.get('/:projectId/chart', getChartData);

export default router;
