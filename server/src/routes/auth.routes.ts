import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many authentication attempts, please try again later'
});

const nonceLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: 'Too many nonce requests, please try again later'
});

// Traditional auth routes
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);

// Web3 auth routes
router.get('/nonce/:address', nonceLimiter, authController.getNonce);
router.post('/verify-signature', authLimiter, authController.verifySignature);

// Token management
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

// Get current user (protected)
router.get('/me', authenticateToken, authController.getCurrentUser);

export default router;
