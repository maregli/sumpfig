import { useState, useCallback } from 'react';
import soundCloudClient, { 
  SoundCloudTrack, 
  SoundCloudPlaylist, 
  SoundCloudSearchResult 
} from '../services/soundCloudClient';

interface UseSoundCloudReturn {
  track: SoundCloudTrack | null;
  playlist: SoundCloudPlaylist | null;
  searchResults: SoundCloudSearchResult[];
  loading: boolean;
  error: string | null;
  getTrack: (url: string) => Promise<SoundCloudTrack | null>;
  getPlaylist: (url: string, loadTracks?: boolean) => Promise<SoundCloudPlaylist | null>;
  searchTracks: (query: string, limit?: number) => Promise<SoundCloudSearchResult[]>;
  clearError: () => void;
}

/**
 * Custom React hook for interacting with SoundCloud API
 */
export const useSoundCloud = (): UseSoundCloudReturn => {
  const [track, setTrack] = useState<SoundCloudTrack | null>(null);
  const [playlist, setPlaylist] = useState<SoundCloudPlaylist | null>(null);
  const [searchResults, setSearchResults] = useState<SoundCloudSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTrack = useCallback(async (url: string): Promise<SoundCloudTrack | null> => {
    if (!soundCloudClient.isValidSoundCloudUrl(url)) {
      setError('Invalid SoundCloud URL');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const trackData = await soundCloudClient.getTrack(url);
      setTrack(trackData);
      return trackData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch track';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPlaylist = useCallback(async (
    url: string, 
    loadTracks: boolean = true
  ): Promise<SoundCloudPlaylist | null> => {
    if (!soundCloudClient.isValidSoundCloudUrl(url)) {
      setError('Invalid SoundCloud URL');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const playlistData = await soundCloudClient.getPlaylist(url, loadTracks);
      setPlaylist(playlistData);
      return playlistData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch playlist';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchTracks = useCallback(async (
    query: string, 
    limit: number = 20
  ): Promise<SoundCloudSearchResult[]> => {
    if (!query.trim()) {
      setError('Search query cannot be empty');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const results = await soundCloudClient.searchTracks(query, limit);
      setSearchResults(results);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search tracks';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    track,
    playlist,
    searchResults,
    loading,
    error,
    getTrack,
    getPlaylist,
    searchTracks,
    clearError,
  };
};

export default useSoundCloud;
