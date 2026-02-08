import { Router } from 'express';
import { SpotifyController } from './spotify-auth.controller';
import { SpotifyAuthService } from './spotify-auth.service';

const router = Router();

const spotifyAuthService = new SpotifyAuthService();
const spotifyController = new SpotifyController(spotifyAuthService);

router.get('/connect', spotifyController.login);
router.get('/callback', spotifyController.callback);

export default router;