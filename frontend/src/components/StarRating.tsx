import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useAuth } from './AuthProvider';

import { submitRating } from 'firebaseServices/firestore';

interface StarRatingProps {
  id?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ id = '' }) => {
  const { user } = useAuth();
  const [fillValue, setFillValue] = useState<number>(0); // Defaults to 0 if not rated yet

  const handleClick = (trackId: string, rating: number) => {
    const userId = user?.uid;
    if (userId) {
      submitRating(trackId, userId, rating)
        .then(() => {
          console.log('Rating submitted successfully');
          setFillValue(rating);
        })
        .catch((error) => {
          console.error('Error submitting rating:', error);
        });
    }
  };

  return (
    <Box display="flex" alignItems="center">
      {[1, 2, 3, 4, 5].map((index) => (
        <IconButton
          key={index}
          onClick={() => handleClick(id, index)}
          size="small"
        >
          {index <= fillValue ? (
            <StarIcon sx={{ color: '#FFD700' }} />
          ) : (
            <StarBorderIcon sx={{ color: '#FFD700' }} />
          )}
        </IconButton>
      ))}
    </Box>
  );
};

export default StarRating;
