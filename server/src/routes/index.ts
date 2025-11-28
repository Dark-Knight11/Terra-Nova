import { Router } from 'express';
import authRoutes from './auth.routes';
import companyRoutes from './company.routes';
import contractRoutes from './contract.routes';

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

// TODO: Add auditor and registry routes when implemented
// router.use('/auditors', auditorRoutes);
// router.use('/registries', registryRoutes);

export default router;
