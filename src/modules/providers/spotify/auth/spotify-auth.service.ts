import fs from 'fs';
import path from 'path';

export interface SpotifyTokens {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at: number;
}

export class SpotifyAuthService {
    private readonly clientId = process.env.SPOTIFY_CLIENT_ID!;
    private readonly clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
    private readonly redirectUri = process.env.SPOTIFY_REDIRECT_URI!;
    private readonly tokenFilePath = path.resolve('data', 'spotify.tokens.json');

    /* ----------------------------------------
     * AUTHORIZE URL
     * ------------------------------------- */
    getAuthorizeUrl(): string {
        const params = new URLSearchParams({
            client_id: this.clientId,
            response_type: 'code',
            redirect_uri: this.redirectUri,
            scope: [
                'user-read-private',
                'user-read-email',
                'playlist-read-private',
                'playlist-modify-private',
                'playlist-modify-public',
                'user-library-read',
            ].join(' '),
        });

        return `https://accounts.spotify.com/authorize?${params.toString()}`;
    }

    /* ----------------------------------------
     * EXCHANGE CODE → TOKENS
     * ------------------------------------- */
    async exchangeCodeForToken(code: string): Promise<SpotifyTokens> {
        const authHeader =
            'Basic ' +
            Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: authHeader,
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: this.redirectUri,
            }),
        });

        const data = await response.json();

        if (!data.access_token || !data.refresh_token) {
            throw new Error('Invalid Spotify token response');
        }

        const tokens: SpotifyTokens = {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_in: data.expires_in,
            expires_at: Date.now() + data.expires_in * 1000,
        };

        this.saveTokens(tokens);
        return tokens;
    }

    /* ----------------------------------------
     * REFRESH ACCESS TOKEN
     * ------------------------------------- */
    async refreshAccessToken(): Promise<void> {
        const currentTokens = this.readTokens();

        if (!currentTokens?.refresh_token) {
            throw new Error('No refresh token available');
        }

        const authHeader =
            'Basic ' +
            Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: authHeader,
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: currentTokens.refresh_token,
            }),
        });

        const data = await response.json();

        if (!data.access_token) {
            throw new Error('Failed to refresh Spotify access token');
        }

        const updatedTokens: SpotifyTokens = {
            access_token: data.access_token,
            expires_in: data.expires_in,
            expires_at: Date.now() + data.expires_in * 1000,
            refresh_token: data.refresh_token ?? currentTokens.refresh_token,
        };

        this.saveTokens(updatedTokens);
    }

    /* ----------------------------------------
     * TOKEN STORAGE
     * ------------------------------------- */
    readTokens(): SpotifyTokens | null {
        if (!fs.existsSync(this.tokenFilePath)) {
            return null;
        }

        return JSON.parse(fs.readFileSync(this.tokenFilePath, 'utf-8'));
    }

    private saveTokens(tokens: SpotifyTokens): void {
        fs.writeFileSync(
            this.tokenFilePath,
            JSON.stringify(tokens, null, 2),
            'utf-8',
        );
    }

    private async getValidAccessToken(): Promise<string> {
        const tokens = this.readTokens();

        if (!tokens) {
            throw new Error('Spotify not connected');
        }

        if (Date.now() >= tokens.expires_at) {
            await this.refreshAccessToken();
            return this.readTokens()!.access_token;
        }

        return tokens.access_token;
    }
}