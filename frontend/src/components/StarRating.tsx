import React, { useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useAuth } from './AuthProvider';
import { useEffect } from 'react';

import { submitRating , getRating } from 'firebaseServices/firestore';

interface StarRatingProps {
  id?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ id = '' }) => {
  const { user } = useAuth();
  const [fillValue, setFillValue] = useState<number>(0); // Defaults to 0 if not rated yet
  const [_isLoading, setIsLoading] = useState(true);

  // Fetch the rating when the component mounts
  useEffect(() => {
    const fetchRating = async () => {
      if (user?.uid) {
        try {
          const rating = await getRating(id, user.uid);
          setFillValue(rating || 0);
        } catch (error) {
          console.error('Error fetching rating:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchRating();
  }, [id, user]);

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
    <Box display="inline-flex" alignItems="center" justifyContent="center" gap={0.5}>
      <Typography variant="body2" color="text.secondary">
        {fillValue > 0 ? `Your rating: ${fillValue}/5` : 'Rate this track'}
      </Typography>

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
