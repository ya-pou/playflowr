import { Router } from 'express';
import spotifyRoutes from './modules/providers/spotify/spotify.routes';

const router = Router();

router.use('/spotify', spotifyRoutes);

export default router;