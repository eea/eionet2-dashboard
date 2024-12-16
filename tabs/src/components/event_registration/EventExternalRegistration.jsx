import React, { useState } from 'react';
import {
  Alert,
  Box,
  Checkbox,
  TextField,
  Button,
  FormControlLabel,
  CircularProgress,
  Backdrop,
} from '@mui/material';

import CheckIcon from '@mui/icons-material/Check';
import SaveIcon from '@mui/icons-material/Save';

import messages from '../../data/messages.json';
import { useConfiguration } from '../../data/hooks/useConfiguration';
import { postParticipant } from '../../data/sharepointProvider';
import { getUserByMail } from '../../data/provider';
import { validateMandatoryField, validateName } from '../../data/validator';
import { HtmlBox } from '../HtmlBox';
import validator from 'validator';

export function EventExternalRegistration({ event, userInfo }) {
  const configuration = useConfiguration();
  const [participant] = useState({
    MeetingId: event.id,
    ParticipantName: '',
    Email: '',
    PhysicalParticipation: false,
    EEAReimbursementRequested: false,
    Registered: true,
    RegistrationDate: new Date(),
    Country: userInfo.country,
    NFPApproved: 'Approved',
    CustomMeetingRequest: 'Registered by NFP',
    IsInvitedByNFP: true,
  });

  const [loading, setLoading] = useState(false),
    [errorText, setErrorText] = useState(''),
    [errors, setErrors] = useState({}),
    [successRegister, setSuccessRegister] = useState(false),
    [physical, setPhysical] = useState(participant.PhysicalParticipation),
    [reimbursement, setReimbursement] = useState(participant.EEAReimbursementRequested);

  const handleRegister = async () => {
      const email = (participant.Email || '').toLowerCase();
      setErrorText('');
      setSuccessRegister(false);
      setLoading(true);

      let tempErrors = validateForm();
      if (
        !tempErrors ||
        !Object.values(tempErrors).some((v) => {
          return v;
        })
      ) {
        if (validator.isEmail(email) && !email.includes('+')) {
          if (email.includes('@eea.europa.eu')) {
            setErrorText(messages.UserInvite.EEAUserError);
          } else {
            const existingUser = await getUserByMail(email);
            if (
              existingUser?.SharepointUser ||
              event.Participants.some((p) => p.Email.toLowerCase() == email)
            ) {
              setErrorText(configuration.EventInvitationByNFPError);
            } else {
              const response = await postParticipant(participant, event);
              if (response) {
                participant.id = response.id;
                event.Participants.push(participant);
                setEventProperties(true);
                setSuccessRegister(true);
              }
            }
          }
        } else {
          setErrorText(messages.UserInvite.InvalidEmail);
        }
      }
      setLoading(false);
    },
    setEventProperties = (hasRegistered) => {
      event.HasRegistered = hasRegistered;
      event.NoOfRegistered = event.Participants.filter((p) => {
        return p.Registered;
      }).length;
    },
    validateField = (e) => {
      let id = e.target.id,
        tempErrors = { ...errors };

      switch (id) {
        case 'name':
          tempErrors.name = validateName(participant.ParticipantName);
          break;
        case 'email':
          tempErrors.email = validateMandatoryField(participant.Email);
          break;
        default:
          console.log('Undefined field for validation');
          break;
      }

      setErrors({ ...tempErrors });
    },
    validateForm = () => {
      let tempErrors = { ...errors };
      tempErrors.name = validateMandatoryField(participant.ParticipantName);
      tempErrors.email = validateMandatoryField(participant.Email);
      setErrors({ ...tempErrors });
      return tempErrors;
    };

  return (
    <Box className="popup" sx={{ maxHeight: '900px' }}>
      <Backdrop
        sx={{ color: 'primary.main', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="primary" />
      </Backdrop>
      <Alert className="w95" sx={{ fontWeight: 'bold' }} severity="warning">
        <HtmlBox html={configuration?.NFPInvitationInfoMessage}></HtmlBox>
      </Alert>
      <Box className="row w95">
        <TextField
          required
          autoComplete="off"
          className="control w50"
          id="name"
          label="Name"
          variant="standard"
          defaultValue={participant.ParticipantName}
          onChange={(e) => {
            participant.ParticipantName = e.target.value;
          }}
          inputProps={{ style: { textTransform: 'capitalize' } }}
          error={Boolean(errors?.name)}
          helperText={errors?.name}
          onBlur={validateField}
        />
        <TextField
          required
          autoComplete="off"
          className="control w50"
          id="email"
          label="Email"
          variant="standard"
          defaultValue={participant.Email}
          onChange={(e) => {
            participant.Email = e.target.value;
          }}
          error={Boolean(errors?.email)}
          helperText={errors?.email}
          onBlur={validateField}
        />
      </Box>
      {event.IsOffline && (
        <Box>
          <FormControlLabel
            sx={{ marginLeft: '0.5rem' }}
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
      {errorText && (
        <Alert className="w95" sx={{ fontWeight: 'bold' }} severity="error">
          <HtmlBox html={errorText}></HtmlBox>
        </Alert>
      )}
      <Box className="row w95" sx={{ marginTop: '1rem' }}>
        <Button
          sx={{ maxWidth: '150px' }}
          onClick={handleRegister}
          variant="contained"
          color="primary"
          size="medium"
          className="button"
          disabled={loading || successRegister}
          endIcon={successRegister ? <CheckIcon /> : <SaveIcon />}
        >
          Register
        </Button>
      </Box>
      {successRegister && (
        <Alert className="w95" sx={{ fontWeight: 'bold' }} severity="info">
          <HtmlBox html={configuration?.NFPInvitationSuccessMessage}></HtmlBox>
        </Alert>
      )}
    </Box>
  );
}
