import { Router } from 'express';
import authRoutes from './auth/spotify-auth.routes';
import clientRoutes from './client/spotify-client.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/client', clientRoutes);

export default router;