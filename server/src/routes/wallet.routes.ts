import { Router } from 'express';
import * as walletController from '../controllers/wallet.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', walletController.getWallets);
router.get('/:address', walletController.getWalletByAddress);

// Protected routes (require authentication)
router.post('/', authenticateToken, walletController.registerWallet);
router.put('/:id', authenticateToken, walletController.updateWalletStatus);

// Wallet linking endpoints
router.post('/link/nonce', authenticateToken, walletController.generateLinkNonce);
router.post('/link', authenticateToken, walletController.linkWallet);

export default router;
