import { React, useState } from 'react';
import { Box, Button, CircularProgress, Backdrop, Rating, Typography } from '@mui/material';

import CheckIcon from '@mui/icons-material/Check';
import SaveIcon from '@mui/icons-material/Save';
import StarIcon from '@mui/icons-material/Star';

import { postRating } from '../../data/sharepointProvider';

const labels = {
  1: 'Useless',
  2: 'Poor',
  3: 'Ok',
  4: 'Good',
  5: 'Excellent',
};

function getLabelText(value) {
  return `${value} Star${value !== 1 ? 's' : ''}, ${labels[value]}`;
}

export function EventRating({ configuration, participant, event, onRate }) {
  const [loading, setLoading] = useState(false),
    [ratingValue, setRatingValue] = useState(5),
    [hover, setHover] = useState(-1),
    [successUpdate, setSuccessUpdate] = useState(false);

  const handleRating = async () => {
    setSuccessUpdate(false);
    setLoading(true);
    const result = await postRating(event, participant, ratingValue);

    setSuccessUpdate(true);
    setLoading(false);
    onRate && onRate(result);
  };

  return (
    <div className="">
      <Box className="popup" sx={{ maxHeight: '900px', marginTop: '0.5rem' }}>
        <Backdrop
          sx={{ color: 'primary.main', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="primary" />
        </Backdrop>
        {configuration.EventRatingModalText && (
          <Typography sx={{ width: '100%' }} variant="subtitle2">
            {configuration.EventRatingModalText}
          </Typography>
        )}
        <Box
          sx={{
            width: 200,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Rating
            name="hover-feedback"
            value={ratingValue}
            precision={1}
            getLabelText={getLabelText}
            onChange={(_event, newValue) => {
              setRatingValue(newValue);
            }}
            onChangeActive={(_event, newHover) => {
              setHover(newHover);
            }}
            emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
          />
          {ratingValue !== null && (
            <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : ratingValue]}</Box>
          )}
        </Box>
        <Box sx={{ marginTop: '1rem' }}>
          <Button
            onClick={handleRating}
            variant="contained"
            color="primary"
            size="medium"
            className="button"
            disabled={loading}
            endIcon={successUpdate ? <CheckIcon /> : <SaveIcon />}
          >
            Confirm rating
          </Button>
        </Box>
      </Box>
    </div>
  );
}
