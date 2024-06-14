"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { 
  Box, 
  Button, 
  Heading, 
  Input, 
  List, 
  ListItem, 
  Link, 
  Stack,
  UnorderedList
} from '@chakra-ui/react';
import ThemeSwitchButton from '../../components/ThemeSwitchButton';
import { Container } from 'postcss';

interface PlaylistData {
  name: string;
  owner: {
    display_name: string;
  };
  tracks: {
    items: {
      track: {
        album: {
          name: string;
        };
      };
    }[];
  };
}

interface AlbumsData {
  [key: string]: {
    link: string;
    count: number;
  };
}

const Home: React.FC = () => {
  const [playlistLink, setPlaylistLink] = useState<string>('');
  const [playlistData, setPlaylistData] = useState<PlaylistData | null>(null);
  const [albumsData, setAlbumsData] = useState<AlbumsData | null>(null);

  const handleGetPlaylist = async () => {
    try {
      const response = await axios.post('/api/getPlaylist', { playlistLink });
      setPlaylistData(response.data);
    } catch (error) {
      console.error('Error fetching playlist data', error);
    }
  };

  const handleGetDiscogsData = async () => {
    if (!playlistData) return;

    const tracks = playlistData.tracks.items.map((item: any) => item.track.album.name);
    try {
      const response = await axios.post('/api/getDiscogsData', { tracks });
      setAlbumsData(response.data);
    } catch (error) {
      console.error('Error fetching Discogs data', error);
    }
  };

  return (
    <>
        <Stack
        margin="auto"
        width="50%"
          as={Box}
          textAlign={'center'}
          spacing={{ base: 8, md: 14 }}
          py={{ base: 20, md: 36 }}>
    <Box p={5}>
      <ThemeSwitchButton />
      <Heading as="h1" size="xl" mb={5}>
        Spotify to Discogs
      </Heading>
      <Input
        placeholder="Enter Spotify Playlist Link"
        value={playlistLink}
        onChange={(e) => setPlaylistLink(e.target.value)}
        mb={3}

        />
        <br/>
      <Button onClick={handleGetPlaylist} colorScheme="teal" mb={5}>
        Fetch Playlist
      </Button>

      {playlistData && (
        <Box p={5} >
          <Heading as="h2" size="md">
            Playlist: {playlistData.name}
          </Heading>
          <Heading as="h2" size="sm" mt={2}>
            By: {playlistData.owner.display_name}
          </Heading>
          <Button onClick={handleGetDiscogsData} colorScheme="teal" mt={3}>
            Find Albums on Discogs
          </Button>
        </Box>
      )}

      {albumsData && (
        <Box p={5} mt={5}>
          <Heading as="h2" size="md" mb={3}>
            Albums on Discogs
          </Heading>
          <UnorderedList margin="auto" textAlign="left" spacing={2}>
            {Object.keys(albumsData).map(album => (
              <ListItem key={album}>
                <Link href={`https://www.discogs.com${albumsData![album].link}`} isExternal color="teal.500">
                  {album} - {albumsData![album].count} tracks
                </Link>
              </ListItem>
            ))}
          </UnorderedList>
        </Box>
      )}
    </Box>
    </Stack>

    </>
  );
};

export default Home;
