export interface Song {
    id: string | null;
    title: string | null;
    artist: string | null;
    length: string | null;
    tags: string[] | null;
    bpm: number | null;
    dateAdded: string | null;
  };
  
export interface Track {
  id: string;
    title: string | null;
    artist: string | null;
  publish_date: string | null;
  rating: number | null;
    genre: string | null;
    likes: number | null;
    playbacks: number | null;
    permalink: string | null;
  artwork_url: string | null;
  tags: string[] | null;
  added_by_name: string | null; // This should be set to the current user's ID when adding a track
  added_by_id: string;
}