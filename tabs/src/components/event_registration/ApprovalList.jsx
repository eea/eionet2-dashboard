import { React, useRef, useState } from 'react';
import { Box, Button, CircularProgress, Backdrop } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import SaveIcon from '@mui/icons-material/Save';
import { patchParticipants } from '../../data/sharepointProvider';
import { Approval } from './Approval';

export function ApprovalList({ event }) {
  const editEvent = useRef(JSON.parse(JSON.stringify(event))),
    [loading, setLoading] = useState(false),
    [success, setSuccess] = useState(false),
    handleUpdate = async () => {
      const currentEvent = editEvent.current;
      setSuccess(false);
      setLoading(true);
      await patchParticipants(currentEvent.Participants, currentEvent);
      event.Participants = currentEvent.Participants;
      setSuccess(true);
      setLoading(false);
    };

  return (
    <Box className="popup" sx={{ width: '1200px' }}>
      <Box sx={{ minHeight: '150px' }}>
        {editEvent.current.Participants.map((participant) => {
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
      <Backdrop
        sx={{ color: '#6b32a8', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
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
      </Backdrop>
    </Box>
  );
}
