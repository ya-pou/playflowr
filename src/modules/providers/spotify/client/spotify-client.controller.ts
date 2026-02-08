import { Request, Response } from "express";
import { SpotifyClientService } from "./spotify-client.service";

export class SpotifyClientController {

    constructor(
        private clientService: SpotifyClientService
    ) { }

    get_me = async (req: Request, res: Response) => {
        const profile = await this.clientService.getMe();
        res.json(profile);
    }

    get_saved_tracks = async (req: Request, res: Response) => {
        const saved_tracks = await this.clientService.getLikedPlaylist();
        res.json(saved_tracks);
    }

}