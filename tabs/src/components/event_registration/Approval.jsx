import { React, useState } from 'react';
import { Box, TextField, Checkbox, Autocomplete, FormControlLabel } from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';

export function Approval({ participant }) {
  const [approvalStatus, setApprovalStatus] = useState(participant.NFPApproved),
    approvalOptions = ['No value', 'Approved', 'Declined'];

  return (
    <Box className="row">
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
      <TextField
        disabled
        className="control"
        id="name"
        label="Name"
        variant="standard"
        defaultValue={participant.ParticipantName}
      />
      <TextField
        disabled
        className="control"
        id="email"
        label="Email"
        variant="standard"
        defaultValue={participant.Email}
      />
      <FormControlLabel
        sx={{ fontSize: '12px' }}
        control={<Checkbox disabled checked={participant.PhysicalParticipation} />}
        label="Physical participation"
        labelPlacement="end"
      />
      <FormControlLabel
        sx={{ fontSize: '12px' }}
        control={<Checkbox disabled checked={participant.EEAReimbursementRequested} />}
        label="Reimbursement requested"
        labelPlacement="end"
      />
      <Autocomplete
        disablePortal
        id="nfp-approval"
        className="control"
        defaultValue={participant.NFPApproved || ''}
        options={approvalOptions}
        onChange={(_e, value) => {
          participant.NFPApproved = value;
          participant.NFPApprovalChanged = true;
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
    </Box>
  );
}
