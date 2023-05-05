import { React, useState } from 'react';
import { Box, TextField, Checkbox, Autocomplete, FormControlLabel } from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';

export function Approval({ participant }) {
  const [approvalStatus, setApprovalStatus] = useState(participant.NFPApproved),
    approvalOptions = ['No value', 'Approved', 'Declined'];

  return (
    <Box className="row box approval-row">
      <Box className="row fixed">
        <TextField
          disabled
          className="control w50"
          id="name"
          label="Name"
          variant="outlined"
          defaultValue={participant.ParticipantName}
        />
        <TextField
          disabled
          className="control w50"
          id="email"
          label="Email"
          variant="outlined"
          defaultValue={participant.Email}
        />
      </Box>
      <Box className="row fixed">
        <FormControlLabel
          sx={{ fontSize: '12px' }}
          className="control"
          control={<Checkbox disabled checked={participant.PhysicalParticipation} />}
          label="Physical participation"
          labelPlacement="end"
        />
        <FormControlLabel
          sx={{ fontSize: '12px' }}
          className="control"
          control={<Checkbox disabled checked={participant.EEAReimbursementRequested} />}
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
        <Autocomplete
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
              variant="outlined"
            />
          )}
        />
      </Box>
    </Box>
  );
}
