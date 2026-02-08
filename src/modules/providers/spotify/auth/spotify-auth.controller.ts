import { Request, Response } from "express";
import { SpotifyAuthService } from "./spotify-auth.service";

export class SpotifyController {

    constructor(
        private authService: SpotifyAuthService
    ) { }

    login = (req: Request, res: Response): void => {
        const authUrl = this.authService.getAuthorizeUrl();
        res.redirect(authUrl);
    }

    callback = async (req: Request, res: Response): Promise<void> => {
        const code = req.query.code as string | undefined;
        const state = req.query.state;

        if (state === null) {
            res.status(500).json({ error: 'No state provided by spotify' });
        }

        if (!code) {
            res.status(400).json({ error: 'Missing authorization code' });
            return;
        }

        try {
            const tokens = await this.authService.exchangeCodeForToken(code);
            res.json({
                message: 'Spotify authentication successfull',
                tokens
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Failed to authenticate with spotify' });
        }
    }

}