import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import querystring from 'querystring';
require('@dotenvx/dotenvx').config();
import rateLimit from 'express-rate-limit';
import NodeCache from 'node-cache';
import cors from 'cors'

const app = express();
const port = process.env.PORT || 8888;
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

app.use(cors())
app.use(express.json());
console.log("in express")

app.get("/", (req: Request, res: Response) => {
  res.send({"spotify": "toDiscogs💿💿💿"})
})

const spotifyClientId = process.env.SPOTIFY_CLIENT_ID as string;
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET as string;
const spotifyRedirectUri = 'http://localhost:8888/callback';

const discogsConsumerKey = process.env.DISCOGS_CONSUMER_KEY as string;
const discogsConsumerSecret = process.env.DISCOGS_CONSUMER_SECRET as string;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

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

app.post('/api/getPlaylist', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { playlistLink } = req.body;

  if (!playlistLink) {
    res.status(400).send('Playlist link is required');
    return;
  }

  const playlistId = playlistLink.split('/playlist/')[1]?.split('?')[0];

  if (!playlistId) {
    res.status(400).send('Invalid playlist link format');
    return;
  }

  try {
    const accessToken = await getSpotifyAccessToken();
    const playlistResponse = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const { name, images, owner, tracks } = playlistResponse.data;
    const playlistImage = images.length ? images[0].url : null;
    const userAvatar = owner.images && owner.images.length ? owner.images[0].url : null;

    res.json({ name, owner: owner.display_name, playlistImage, userAvatar, tracks: tracks.items });
  } catch (error: any) {
    console.error('Error fetching playlist:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      res.status(404).send('Playlist not found');
    } else {
      res.status(500).send('Error fetching playlist');
    }
  }
});

interface AlbumData {
  count: number;
  link: string;
  image: string | null;
}

// Exponential backoff retry mechanism
async function fetchWithRetry(url: string, options: any, retries: number = 5, delay: number = 1000): Promise<any> {
  try {
    return await axios.get(url, options);
  } catch (error: any) {
    if (error.response?.status === 429 && retries > 0) {
      console.warn(`Rate limit exceeded. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

app.post('/api/getDiscogsData', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { tracks } = req.body;
  console.log("🦊: ~ app.post ~ req.body: ", req.body);

  if (!tracks || !Array.isArray(tracks)) {
    res.status(400).send('Tracks must be provided as an array');
    return;
  }

  let albums: { [key: string]: AlbumData } = {};

  try {
    console.log(tracks);
    for (const track of tracks) {
      const cachedResult = cache.get(track);
      if (cachedResult) {
        albums = { ...albums, ...cachedResult };
        continue;
      }

      const url = `https://api.discogs.com/database/search?page=1&per_page=1&q=${track}&type=release&key=${discogsConsumerKey}&secret=${discogsConsumerSecret}`;
      const options = {};

      const searchResponse = await fetchWithRetry(url, options);
      const result = searchResponse.data.results;
      if (result.length > 0 && result[0].title) {
        let albumTitle = result[0].title;
        console.log("🦊: ~ app.post ~ results: ", albumTitle);
        if (!albums[albumTitle]) {
          albums[albumTitle] = { count: 0, link: result[0].uri, image: result[0].cover_image || null };
        }
        albums[albumTitle].count++;
        cache.set(track, albums); // Cache the result for this track
      } else {
        console.warn(`No results found for track: ${track}`);
      }
    }

    const sortedAlbums = Object.entries(albums).sort((a, b) => b[1].count - a[1].count).reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as { [key: string]: AlbumData });

    res.json(sortedAlbums);
  } catch (error: any) {
    console.error('Error fetching Discogs data:', error.response?.data || error.message);
    res.status(500).send('Error fetching Discogs data');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
