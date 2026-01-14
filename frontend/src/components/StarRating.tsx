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

  // Fetch the rating when the component mounts
  useEffect(() => {
    const fetchRating = async () => {
      if (user?.uid) {
        try {
          const rating = await getRating(id, user.uid);
          setFillValue(rating || 0);
        } catch (error) {
          console.error('Error fetching rating:', error);
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
    } else {
      // Not logged in: save rating to localStorage
      try {
        const key = `rating_${trackId}`;
        localStorage.setItem(key, JSON.stringify({ rating, timestamp: new Date() }));
        console.log('Rating saved to local cache');
        setFillValue(rating);
      } catch (e) {
        console.error('Error saving rating to local cache:', e);
      }
    }
  };
  

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={1.5}>
      <Typography 
        variant="subtitle2" 
        sx={{
          fontWeight: 600,
          color: '#1e293b',
          textAlign: 'center',
        }}
      >
        {fillValue > 0 ? (
          <Box component="span">
            Your rating: <Box component="span" sx={{ color: '#6366f1', fontWeight: 700 }}>{fillValue}/5</Box>
          </Box>
        ) : (
          'Rate this track'
        )}
      </Typography>

      <Box display="inline-flex" alignItems="center" justifyContent="center" gap={0.5}>
        {[1, 2, 3, 4, 5].map((index) => (
          <IconButton
            key={index}
            onClick={() => handleClick(id, index)}
            size="small"
            sx={{
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.2)',
              },
            }}
          >
            {index <= fillValue ? (
              <StarIcon 
                sx={{ 
                  color: '#fbbf24',
                  fontSize: '2rem',
                  filter: 'drop-shadow(0 2px 4px rgba(251, 191, 36, 0.4))',
                }} 
              />
            ) : (
              <StarBorderIcon 
                sx={{ 
                  color: '#d1d5db',
                  fontSize: '2rem',
                  '&:hover': {
                    color: '#fbbf24',
                  },
                }} 
              />
            )}
          </IconButton>
        ))}
      </Box>
    </Box>
  );
};

export default StarRating;
