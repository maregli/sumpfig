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
    album: string | null;
    release_date: string | null;
    publish_date: string | null;
    genre: string | null;
    likes: number | null;
    playbacks: number | null;
    permalink: string | null;
  artwork_url: string | null;
  tags: string[] | null;
}