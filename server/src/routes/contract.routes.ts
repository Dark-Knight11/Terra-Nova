import { Router } from 'express';
import * as contractController from '../controllers/contract.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All contract routes require authentication
router.get('/balance/:address', authenticateToken, contractController.getCreditBalance);
router.get('/project/:id', authenticateToken, contractController.getProjectDetails);
router.post('/verify-transaction', authenticateToken, contractController.verifyTransaction);
router.get('/events', authenticateToken, contractController.getRecentEvents);

export default router;
