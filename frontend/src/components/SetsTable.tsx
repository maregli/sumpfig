import React from "react";
import songs from "data/songs.json";
import SongCard from "./SongCard"; // Adjust path if needed

type Song = {
  title: string;
  artist: string;
  length: string;
  tags: string[];
  bpm: number;
  dateAdded: string;
};

const SetsTable: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Song List</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {songs.map((song: Song, index: number) => (
          <SongCard key={index} song={song} />
        ))}
      </div>
    </div>
  );
};

export default SetsTable;
