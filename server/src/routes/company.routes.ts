import { Router } from 'express';
import * as companyController from '../controllers/company.controller';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', companyController.getAllCompanies);
router.get('/:id', companyController.getCompanyById);

// Protected routes (require authentication)
router.get('/me/profile', authenticateToken, requireRole('COMPANY'), companyController.getMyCompany);
router.post('/', authenticateToken, requireRole('COMPANY'), companyController.createCompany);
router.put('/:id', authenticateToken, companyController.updateCompany);
router.delete('/:id', authenticateToken, requireRole('COMPANY'), companyController.deleteCompany);

// Admin routes (AUDITOR/REGISTRY only)
router.put('/:id/verify', authenticateToken, requireRole('AUDITOR', 'REGISTRY'), companyController.verifyCompany);

// Wallet linking
router.post('/:id/link-wallet', authenticateToken, requireRole('COMPANY'), companyController.linkWallet);

export default router;
