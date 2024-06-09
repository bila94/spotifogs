import express, { Request, Response } from 'express';
import axios from 'axios';
import querystring from 'querystring';
require('@dotenvx/dotenvx').config()

const app = express();
const port = process.env.PORT || 8888;

app.use(express.json());

const spotifyClientId = process.env.SPOTIFY_CLIENT_ID as string;
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET as string;
const spotifyRedirectUri = 'http://localhost:8888/callback'

const discogsConsumerKey = process.env.DISCOGS_CONSUMER_KEY as string;
const discogsConsumerSecret = process.env.DISCOGS_CONSUMER_SECRET as string;

async function getSpotifyAccessToken(): Promise<string> {
  const response = await axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${spotifyClientId}:${spotifyClientSecret}`).toString('base64')
    },
    data: querystring.stringify({ grant_type: 'client_credentials' })
  });
  return response.data.access_token;
}

app.post('/api/getPlaylist', async (req: Request, res: Response) => {
  const { playlistLink } = req.body;
  const playlistId = playlistLink.split('/playlist/')[1].split('?')[0];
  const accessToken = await getSpotifyAccessToken();

  try {
    const playlistResponse = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    res.json(playlistResponse.data);
  } catch (error) {
    console.error('Error fetching playlist:', error);
    res.status(500).send('Error fetching playlist');
  }
});

app.post('/api/getDiscogsData', async (req: Request, res: Response) => {
  const { tracks } = req.body;
  let albums: { [key: string]: { count: number; link: string; price: string | null } } = {};

  try {
    for (const track of tracks) {
      const searchResponse = await axios.get(`https://api.discogs.com/database/search?q=${track}&type=release&key=${discogsConsumerKey}&secret=${discogsConsumerSecret}`);
      const results = searchResponse.data.results;

      results.forEach((result: any) => {
        const albumTitle = result.title;
        if (!albums[albumTitle]) {
          albums[albumTitle] = { count: 0, link: result.uri, price: null };
        }
        albums[albumTitle].count++;
      });
    }
    res.json(albums);
  } catch (error) {
    console.error('Error fetching Discogs data:', error);
    res.status(500).send('Error fetching Discogs data');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
