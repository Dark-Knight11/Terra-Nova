import { Router } from 'express';
import authRoutes from './auth.routes';
import companyRoutes from './company.routes';
import contractRoutes from './contract.routes';
import creditRoutes from './credit.routes';
import walletRoutes from './wallet.routes';
import proposalRoutes from './proposal.routes';
import marketRoutes from './market.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API routes
router.use('/auth', authRoutes);
router.use('/companies', companyRoutes);
router.use('/contracts', contractRoutes);
router.use('/credits', creditRoutes);
router.use('/wallets', walletRoutes);
router.use('/proposals', proposalRoutes);
router.use('/market', marketRoutes);

// TODO: Add auditor and registry routes when implemented
// router.use('/auditors', auditorRoutes);
// router.use('/registries', registryRoutes);

export default router;
