import { Router } from 'express';
import * as proposalController from '../controllers/proposal.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', proposalController.getProposals);
router.get('/:id', proposalController.getProposalById);

// Protected routes (require authentication)
router.post('/', authenticateToken, proposalController.createProposal);
router.post('/:id/vote', authenticateToken, proposalController.voteOnProposal);
router.put('/:id', authenticateToken, proposalController.updateProposal);

export default router;
