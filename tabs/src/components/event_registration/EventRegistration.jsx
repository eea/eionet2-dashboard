import { React, useState } from 'react';
import {
  Box,
  Checkbox,
  TextField,
  Button,
  FormControlLabel,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import {
  postParticipant,
  patchParticipant,
  deleteParticipant,
} from '../../data/sharepointProvider';
import CheckIcon from '@mui/icons-material/Check';
import SaveIcon from '@mui/icons-material/Save';

export function EventRegistration({ participant, event }) {
  const [loading, setLoading] = useState(false),
    [successRegister, setSuccessRegister] = useState(false),
    [successUpdate, setSuccessUpdate] = useState(false),
    [successUnregister, setSuccessUnregister] = useState(false),
    [physical, setPhysical] = useState(participant.PhysicalParticipation),
    [reimbursement, setReimbursement] = useState(participant.EEAReimbursementRequested);

  const handleRegister = async () => {
      setSuccessRegister(false);
      setLoading(true);
      participant.Registered = true;
      participant.RegistrationDate = new Date();
      const response = await postParticipant(participant, event);
      if (response) {
        participant.id = response.id;
        event.Participants.push(participant);
        setEventProperties(true);
      }
      setSuccessRegister(true);
      setLoading(false);
    },
    handleUpdateRegistration = async () => {
      setSuccessUpdate(false);
      setLoading(true);
      participant.NFPApproved = 'No value';
      participant.Registered = true;
      await patchParticipant(participant, event);
      setEventProperties(true);
      setSuccessUpdate(true);
      setLoading(false);
    },
    handleUnregister = async () => {
      setSuccessUnregister(false);
      setLoading(true);
      participant.Registered = false;
      await deleteParticipant(participant, event);
      setEventProperties(false);
      setSuccessUnregister(true);
      setLoading(false);
    },
    setEventProperties = (hasRegistered) => {
      event.HasRegistered = hasRegistered;
      event.NoOfRegistered = event.Participants.filter((p) => {
        return p.Registered;
      }).length;
    };

  return (
    <Box className="popup" sx={{ width: '1000px' }}>
      <Backdrop
        sx={{ color: '#6b32a8', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="primary" />
      </Backdrop>
      <Box className="row">
        <TextField
          variant="standard"
          className="control"
          disabled
          label="Name"
          defaultValue={participant.ParticipantName}
        ></TextField>
        <TextField
          variant="standard"
          className="control"
          disabled
          label="Email"
          defaultValue={participant.Email}
        ></TextField>
        <TextField
          variant="standard"
          className="control"
          disabled
          label="Country"
          defaultValue={participant.Country}
        ></TextField>
      </Box>
      {event.IsOffline && (
        <Box className="row">
          <FormControlLabel
            control={
              <Checkbox
                checked={physical}
                color="secondary"
                onChange={(_e, value) => {
                  setPhysical(value);
                  participant.PhysicalParticipation = value;
                  if (!value) {
                    setReimbursement(false);
                    participant.EEAReimbursementRequested = false;
                  }
                }}
              />
            }
            label="Physical participation"
            labelPlacement="end"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={reimbursement}
                disabled={!physical}
                color="secondary"
                onChange={(_e, value) => {
                  setReimbursement(value);
                  participant.EEAReimbursementRequested = value;
                }}
              />
            }
            label="Reimbursement requested"
            labelPlacement="end"
          />
        </Box>
      )}
      {event.IsOffline && (
        <TextField
          multiline
          label="Custom meeting request"
          className="control"
          variant="standard"
          rows={2}
          maxRows={4}
          defaultValue={participant.CustomMeetingRequest}
          style={{ width: '99%' }}
          onChange={(event) => {
            const { value } = event.target;
            participant.CustomMeetingRequest = value;
          }}
        />
      )}
      <Box sx={{ marginTop: '1rem' }}>
        {!participant.Registered && (
          <Button
            onClick={handleRegister}
            variant="contained"
            color="secondary"
            size="medium"
            className="button"
            disabled={loading}
            endIcon={successRegister ? <CheckIcon /> : <SaveIcon />}
          >
            Register
          </Button>
        )}
        {participant.Registered && event.IsOffline && (
          <Button
            onClick={handleUpdateRegistration}
            variant="contained"
            color="secondary"
            size="medium"
            className="button"
            disabled={loading}
            endIcon={successUpdate ? <CheckIcon /> : <SaveIcon />}
          >
            Update registration
          </Button>
        )}
        {participant.Registered && (
          <Button
            onClick={handleUnregister}
            variant="contained"
            color="error"
            size="medium"
            className="button"
            disabled={loading || !participant.Registered}
            endIcon={successUnregister ? <CheckIcon /> : <SaveIcon />}
          >
            Unregister
          </Button>
        )}
      </Box>
    </Box>
  );
}
