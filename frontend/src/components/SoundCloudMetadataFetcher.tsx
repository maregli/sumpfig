import React, { useState } from 'react';
import { useSoundCloud } from '../hooks/useSoundCloud';
import soundCloudClient from '../services/soundCloudClient';

/**
 * Example component demonstrating how to use the SoundCloud service
 * to fetch and display track metadata
 */
const SoundCloudMetadataFetcher: React.FC = () => {
  const [url, setUrl] = useState('');
  const { track, loading, error, getTrack, clearError } = useSoundCloud();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      await getTrack(url);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (error) {
      clearError();
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>SoundCloud Track Metadata Fetcher</h2>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={url}
            onChange={handleInputChange}
            placeholder="Enter SoundCloud track URL"
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '14px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: loading ? '#ccc' : '#ff5500',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Fetching...' : 'Fetch Metadata'}
          </button>
        </div>
      </form>

      {error && (
        <div
          style={{
            padding: '15px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c33',
            marginBottom: '20px'
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {track && (
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f9f9f9'
          }}
        >
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            {track.artwork_url && (
              <img
                src={soundCloudClient.getHighQualityArtwork(track.artwork_url)}
                alt={track.title}
                style={{
                  width: '200px',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '4px'
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 10px 0' }}>{track.title}</h3>
              <p style={{ margin: '5px 0', color: '#666' }}>
                <strong>Artist:</strong> {track.artist || track.artist_name || 'Unknown'}
              </p>
              {track.genre && (
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Genre:</strong> {track.genre}
                </p>
              )}
              <p style={{ margin: '5px 0', color: '#666' }}>
                <strong>Duration:</strong> {soundCloudClient.formatDuration(track.duration)}
              </p>
              <p style={{ margin: '5px 0', color: '#666' }}>
                <strong>Plays:</strong> {track.playback_count.toLocaleString()}
              </p>
              <p style={{ margin: '5px 0', color: '#666' }}>
                <strong>Likes:</strong> {track.likes_count.toLocaleString()}
              </p>
              {track.release_date && (
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Release Date:</strong> {new Date(track.release_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {track.description && (
            <div style={{ marginTop: '15px' }}>
              <strong>Description:</strong>
              <p style={{ margin: '5px 0', color: '#666', whiteSpace: 'pre-wrap' }}>
                {track.description}
              </p>
            </div>
          )}

          {track.user && (
            <div
              style={{
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#fff',
                borderRadius: '4px'
              }}
            >
              <strong>Artist Info:</strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                {track.user.avatar_url && (
                  <img
                    src={track.user.avatar_url}
                    alt={track.user.username}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                )}
                <div>
                  <p style={{ margin: '0', fontWeight: 'bold' }}>
                    {track.user.full_name || track.user.username}
                  </p>
                  <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                    @{track.user.username}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: '15px' }}>
            <a
              href={track.permalink_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#ff5500',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              View on SoundCloud
            </a>
          </div>
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <h4>Example URLs to try:</h4>
        <ul>
          <li>
            <code>https://soundcloud.com/artist/track-name</code>
          </li>
          <li>Any valid SoundCloud track URL</li>
        </ul>
      </div>
    </div>
  );
};

export default SoundCloudMetadataFetcher;
