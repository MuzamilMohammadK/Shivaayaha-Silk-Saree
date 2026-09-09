import { Router } from 'express';
import { getDashboardOverview } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/overview', getDashboardOverview);

export default router;
