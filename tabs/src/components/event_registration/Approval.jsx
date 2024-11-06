import React, { useState } from 'react';
import {
  Box,
  TextField,
  Checkbox,
  Autocomplete,
  FormControlLabel,
  Typography,
} from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';

export function Approval({ participant }) {
  const [approvalStatus, setApprovalStatus] = useState(participant.NFPApproved),
    [physical, setPhysical] = useState(participant.PhysicalParticipation),
    [reimbursement, setReimbursement] = useState(participant.EEAReimbursementRequested),
    approvalOptions = ['No value', 'Approved', 'Declined'];

  return (
    <Box className="row box approval-row">
      <Box className="row fixed">
        <TextField
          disabled
          className="control w50"
          id="name"
          label="Name"
          variant="standard"
          defaultValue={participant.ParticipantName}
        />
        <TextField
          disabled
          className="control w50"
          id="email"
          label="Email"
          variant="standard"
          defaultValue={participant.Email}
        />
      </Box>
      <Box className="row fixed">
        <FormControlLabel
          sx={{ fontSize: '12px' }}
          className="control"
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
                participant.changed = true;
              }}
            />
          }
          label="Physical participation"
          labelPlacement="end"
        />
        <FormControlLabel
          sx={{ fontSize: '12px' }}
          className="control"
          control={
            <Checkbox
              checked={reimbursement}
              disabled={!physical}
              color="secondary"
              onChange={(_e, value) => {
                setReimbursement(value);
                participant.EEAReimbursementRequested = value;
                participant.changed = true;
              }}
            />
          }
          label="Reimbursement requested"
          labelPlacement="end"
        />
        {approvalStatus == 'Approved' && (
          <AssignmentTurnedInIcon
            sx={{ alignSelf: 'center' }}
            color="primary"
          ></AssignmentTurnedInIcon>
        )}
        {approvalStatus == 'Declined' && (
          <AssignmentLateIcon sx={{ alignSelf: 'center' }} color="error"></AssignmentLateIcon>
        )}
        {approvalStatus != 'Approved' && approvalStatus != 'Declined' && (
          <AssignmentLateIcon sx={{ alignSelf: 'center' }} color="warning"></AssignmentLateIcon>
        )}
        {!participant.IsInvitedByNFP && (
          <Autocomplete
            id="nfp-approval"
            className="control"
            defaultValue={participant.NFPApproved || ''}
            options={approvalOptions}
            onChange={(_e, value) => {
              participant.NFPApproved = value;
              participant.changed = true;
              setApprovalStatus(value);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                autoComplete="off"
                className="small-width"
                label="Approval status"
                variant="standard"
              />
            )}
          />
        )}
        {participant.IsInvitedByNFP && (
          <Typography sx={{ alignSelf: 'center' }} color="text.secondary" className="control">
            {'Invited by NFP'}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
