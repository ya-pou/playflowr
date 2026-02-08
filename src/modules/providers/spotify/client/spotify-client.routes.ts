import { Router } from 'express';
import { SpotifyAuthService } from '../auth/spotify-auth.service';
import { SpotifyClientService } from './spotify-client.service';
import { SpotifyClientController } from './spotify-client.controller';

const router = Router();

const spotifyClientService = new SpotifyClientService(new SpotifyAuthService());
const spotifyClientController = new SpotifyClientController(spotifyClientService)

router.get('/me/liked', spotifyClientController.get_saved_tracks);
router.get('/me', spotifyClientController.get_me);

export default router;