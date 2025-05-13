// components/StarRating.tsx
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
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const handleClick = (id: string, rating: number) => {
    const userId = user?.uid;
    if (userId) {
      submitRating(id, userId, rating)
        .then(() => {
          console.log('Rating submitted successfully');
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
          onMouseEnter={() => setHoverValue(index)}
          onMouseLeave={() => setHoverValue(null)}
          size="small"
        >
          {(hoverValue ?? 0) >= index ? (
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
