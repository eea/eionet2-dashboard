import React, { useRef, useState } from 'react';
import { Box, Button, CircularProgress, Backdrop } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import SaveIcon from '@mui/icons-material/Save';
import { patchParticipants } from '../../data/sharepointProvider';
import { Approval } from './Approval';
import { HtmlBox } from '../HtmlBox';
import { useConfiguration } from '../../data/hooks/useConfiguration';

export function ApprovalList({ event }) {
  const configuration = useConfiguration(),
    editEvent = useRef(JSON.parse(JSON.stringify(event))),
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
    <Box className="popup" sx={{ overflowY: 'auto' }}>
      <Box sx={{ minHeight: '150px' }}>
        {editEvent.current.Participants.map((participant) => {
          return <Approval key={participant.id} participant={participant}></Approval>;
        })}
      </Box>
      <HtmlBox html={configuration?.EventApprovalInfo}></HtmlBox>
      <Button
        sx={{ marginTop: '1rem' }}
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
        sx={{ color: 'primary.main', zIndex: (theme) => theme.zIndex.drawer + 1 }}
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
