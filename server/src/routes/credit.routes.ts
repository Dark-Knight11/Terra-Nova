import { Router } from 'express';
import * as creditController from '../controllers/credit.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', creditController.getCredits);
router.get('/:id', creditController.getCreditById);

// Protected routes (require authentication)
router.post('/', authenticateToken, creditController.createCredit);
router.put('/:id', authenticateToken, creditController.updateCredit);
router.delete('/:id', authenticateToken, creditController.deleteCredit);

export default router;
