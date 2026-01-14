/**
 * SoundCloud API Client
 * Interfaces with the SoundCloud microservice to fetch track metadata
 */

const SOUNDCLOUD_API_URL = process.env.REACT_APP_SOUNDCLOUD_API_URL || 'http://localhost:5002';

export interface SoundCloudUser {
  id: number;
  username: string;
  full_name?: string;
  permalink_url: string;
  avatar_url?: string;
}

export interface SoundCloudTrack {
  id: number;
  title: string;
  artist?: string;
  artist_name?: string;
  duration?: number;
  duration_seconds?: number;
  genre?: string;
  likes_count: number;
  playback_count: number;
  permalink_url: string;
  artwork_url?: string;
  description?: string;
  created_at: string;
  release_date?: string;
  downloadable: boolean;
  streamable: boolean;
  user?: SoundCloudUser;
}

export interface SoundCloudPlaylist {
  id: number;
  title: string;
  description?: string;
  duration?: number;
  track_count: number;
  artwork_url?: string;
  permalink_url: string;
  created_at: string;
  user?: SoundCloudUser;
  tracks?: Array<{
    id: number;
    title: string;
    duration?: number;
    permalink_url: string;
    artwork_url?: string;
  }>;
}

export interface SoundCloudSearchResult {
  id: number;
  title: string;
  duration?: number;
  genre?: string;
  likes_count: number;
  playback_count: number;
  permalink_url: string;
  artwork_url?: string;
  user?: {
    username: string;
    full_name?: string;
  };
}

class SoundCloudClient {
  private baseUrl: string;

  constructor(baseUrl: string = SOUNDCLOUD_API_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch track metadata from a SoundCloud URL
   */
  async getTrack(url: string): Promise<SoundCloudTrack> {
    try {
      const response = await fetch(`${this.baseUrl}/api/soundcloud/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch track: ${error.message}`);
      }
      throw new Error('Failed to fetch track: Unknown error');
    }
  }

  /**
   * Fetch playlist metadata from a SoundCloud URL
   */
  async getPlaylist(url: string, loadTracks: boolean = true): Promise<SoundCloudPlaylist> {
    try {
      const response = await fetch(`${this.baseUrl}/api/soundcloud/playlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, loadTracks }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch playlist: ${error.message}`);
      }
      throw new Error('Failed to fetch playlist: Unknown error');
    }
  }

  /**
   * Search for tracks on SoundCloud
   */
  async searchTracks(query: string, limit: number = 20): Promise<SoundCloudSearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/soundcloud/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, limit }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to search tracks: ${error.message}`);
      }
      throw new Error('Failed to search tracks: Unknown error');
    }
  }

  /**
   * Check if the SoundCloud service is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Validate if a URL is a valid SoundCloud URL
   */
  isValidSoundCloudUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname === 'soundcloud.com' || urlObj.hostname === 'www.soundcloud.com';
    } catch {
      return false;
    }
  }

  /**
   * Format duration from milliseconds to human-readable format
   */
  formatDuration(milliseconds?: number): string {
    if (!milliseconds) return '0:00';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Get high quality artwork URL
   */
  getHighQualityArtwork(artworkUrl?: string): string | undefined {
    if (!artworkUrl) return undefined;
    // Replace the size parameter with a larger one
    return artworkUrl.replace('-large', '-t500x500');
  }
}

// Export a singleton instance
const soundCloudClient = new SoundCloudClient();
export default soundCloudClient;
