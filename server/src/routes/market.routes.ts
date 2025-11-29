import { Router } from 'express';
import { getMarketData, getChartData, getListings, createListing } from '../controllers/market.controller';

const router = Router();

router.get('/', getListings);
router.post('/', createListing);
router.get('/:projectId', getMarketData);
router.get('/:projectId/chart', getChartData);

export default router;
