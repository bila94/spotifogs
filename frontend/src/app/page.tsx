"use client"
import React, { useState } from 'react';
import axios from 'axios';

const Home: React.FC = () => {
  const [playlistLink, setPlaylistLink] = useState('');
  const [playlistData, setPlaylistData] = useState<any>(null);
  const [albumsData, setAlbumsData] = useState<any>(null);

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
    <div>
      <h1 className='p-5 text-2xl'>Spotify to Discogs</h1>
      <input 
        className='mx-10 px-5'
        type="text"
        placeholder="Enter Spotify Playlist Link"
        value={playlistLink}
        onChange={(e) => setPlaylistLink(e.target.value)}
      />
      <button className='btn' onClick={handleGetPlaylist}>Fetch Playlist</button>

      {playlistData && (
        <div className='p-5'>
          <h2>Playlist: {playlistData.name}</h2>
          <h2>By: {playlistData.owner.display_name}</h2>
          <button onClick={handleGetDiscogsData}>Find Albums on Discogs</button>
        </div>
      )}

      {albumsData && (
        <div className='p-5'>
          <h2>Albums on Discogs</h2>
          <ul>
            {Object.keys(albumsData).map(album => (
              <li key={album}>
                <a href={`https://www.discogs.com${albumsData[album].link}`} target="_blank" rel="noopener noreferrer">
                  {album} - {albumsData[album].count} tracks
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Home;
