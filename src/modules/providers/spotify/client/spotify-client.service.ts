import { Request } from "express";
import { SpotifyAuthService } from "../auth/spotify-auth.service";

export class SpotifyClientService {

    constructor(
        private authService: SpotifyAuthService
    ) { }

    async request(url: string, options: RequestInit = {}): Promise<any> {
        const baseUrl = process.env.SPOTIFY_API_URL || "https://api.spotify.com/v1";
        const tokens = this.authService.readTokens();

        if (!tokens) {
            throw new Error('Spotify not connected');
        }

        if (Date.now() >= tokens.expires_at - 60_000) {
            await this.authService.refreshAccessToken();
        }

        const accessToken = this.authService.readTokens()!.access_token;

        const response = await fetch(`${baseUrl}${url}`, {
            ...options,
            headers: {
                ...(options.headers || {}),
                Authorization: `Bearer ${accessToken}`
            }
        });
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error?.message ?? 'Spotify API error');
        }

        return data;
    }

    async getMe() {
        const request = await this.request('/me');
        return request;
    }

    async getLikedPlaylist() {
        const request = await this.request('/me/tracks');
        let tracks: any[] = []; //Type à remplacer par une interface
        request.items.forEach((item: any) => {
            tracks.push({
                id: item.track.id,
                name: item.track.name,
                artist: item.track.artists[0].name,
                link: item.track.external_urls.spotify,
                image: item.track.album.images[0].url,
                album: item.track.album.name,
                release_date: item.track.album.release_date,
                added_at: item.added_at
            });
        });
        console.log(tracks);
        return tracks;
    }
}