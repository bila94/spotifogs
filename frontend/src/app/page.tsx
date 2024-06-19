"use client";
import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Heading,
  Input,
  ListItem,
  Link,
  Stack,
  Image,
  UnorderedList,
  Card,
  CardBody,
  CardFooter,
  Text,
  HStack,
  Center,
  Flex,
  List,
} from '@chakra-ui/react';
import ThemeSwitchButton from '../../components/ThemeSwitchButton';

interface PlaylistData {
  name: string;
  owner: string;
  playlistImage: string | null;
  userAvatar: string | null;
  tracks: {
    track: {
      album: {
        name: string;
      };
    };
  }[];
}

interface AlbumsData {
  [key: string]: {
    link: string;
    count: number;
    image: string | null;
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

    const albumNames = playlistData.tracks.map(item => item.track.album.name);
    try {
      const response = await axios.post('/api/getDiscogsData', { tracks: albumNames });
      setAlbumsData(response.data);
    } catch (error) {
      console.error('Error fetching Discogs data', error);
    }
  };

  return (
    <Stack
      margin="auto"
      width={{ base: "90%", md: "50%" }}
      as={Box}
      textAlign="center"
      spacing={{ base: 8, md: 14 }}
      py={{ base: 20, md: 36 }}
    >
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
        <Button onClick={handleGetPlaylist} colorScheme="teal" mb={5}>
          Fetch Playlist
        </Button>

        {playlistData && (
          <Card maxWidth="20rem" mx="auto">
            <CardBody>
              {playlistData.playlistImage && (
                <Center mb={3}>
                  <Image borderRadius="5%" src={playlistData.playlistImage} alt="Playlist Image" />
                </Center>
              )}
              <Heading as="h2" size="md">
                Playlist: {playlistData.name}
              </Heading>
              {playlistData.userAvatar && (
                <Center mb={3}>
                  <Image src={playlistData.userAvatar} alt="User Avatar" borderRadius="full" boxSize="50px" />
                </Center>
              )}
              <Heading as="h2" size="sm" mt={2}>
                By: {playlistData.owner}
              </Heading>
            </CardBody>
            <CardFooter>
              <Center width="100%">
                <Button onClick={handleGetDiscogsData} colorScheme="teal">
                  Find Albums on Discogs
                </Button>
              </Center>
            </CardFooter>
          </Card>
        )}

        {albumsData && (
          <Box p={5} mt={5}>
            <Heading as="h2" size="md" mb={3}>
              Albums on Discogs
            </Heading>
            <List margin="auto" textAlign="left" spacing={2}>
              {Object.keys(albumsData).map(album => (
                <ListItem key={album}>
                  <Card p="0.5rem">
                    <HStack alignItems="center">
                      {albumsData[album].image && (
                        <Center boxSize="50px" mr={3}>
                          <Image borderRadius="5%" src={albumsData[album].image as string} alt={album} />
                        </Center>
                      )}
                      <CardBody>
                        <Link href={`https://www.discogs.com${albumsData[album].link}`} isExternal color="teal.500">
                          <Text as="span" fontWeight="bold">
                            {album}
                          </Text>{' '}
                          - {albumsData[album].count} tracks
                        </Link>
                      </CardBody>
                    </HStack>
                  </Card>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>
    </Stack>
  );
};

export default Home;
