import React from "react";

type Song = {
  title: string;
  artist: string;
  length: string;
  tags: string[];
  bpm: number;
  dateAdded: string;
};

type Props = {
  song: Song;
};

const SongCard: React.FC<Props> = ({ song }) => {
    return (
      <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-200 hover:shadow-lg transition-all flex items-center space-x-4">
        <div className="flex-shrink-0">
          {/* Placeholder for image or icon, can add album art or other visual */}
          <div className="w-20 h-20 bg-gray-300 rounded-md"></div>
        </div>
  
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{song.title}</h3>
          <p className="text-sm text-gray-600 mb-1">Artist: {song.artist}</p>
          <p className="text-sm text-gray-600 mb-1">Length: {song.length}</p>
          <p className="text-sm text-gray-600 mb-1">BPM: {song.bpm}</p>
  
          <div className="text-sm text-gray-600 mb-1">
            Tags:{" "}
            <span className="inline-block">
              {song.tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-1"
                >
                  {tag}
                </span>
              ))}
            </span>
          </div>
  
          <p className="text-xs text-gray-400 mt-2">
            Added on: {new Date(song.dateAdded).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  };
  

export default SongCard;
