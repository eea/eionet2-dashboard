import { React, useState } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import SaveIcon from '@mui/icons-material/Save';
import { patchParticipants } from '../../data/sharepointProvider';
import { Approval } from './Approval';

export function ApprovalList({ event }) {
  const [loading, setLoading] = useState(false),
    [success, setSuccess] = useState(false),
    handleUpdate = async () => {
      setSuccess(false);
      setLoading(true);
      await patchParticipants(event.Participants, event);
      setSuccess(true);
      setLoading(false);
    };

  return (
    <Box className="popup" sx={{ width: '1200px' }}>
      <Box sx={{ minHeight: '150px' }}>
        {event.Participants.map((participant) => {
          return <Approval key={participant.id} participant={participant}></Approval>;
        })}
      </Box>
      <Button
        onClick={handleUpdate}
        variant="contained"
        color="secondary"
        size="medium"
        className="button"
        disabled={loading}
        endIcon={success ? <CheckIcon /> : <SaveIcon />}
      >
        Update
      </Button>
      {loading && (
        <CircularProgress
          color="primary"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-12px',
            marginLeft: '-12px',
          }}
        />
      )}
    </Box>
  );
}
