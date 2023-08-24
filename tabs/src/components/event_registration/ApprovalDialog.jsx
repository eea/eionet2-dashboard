import { React } from 'react';
import { Dialog, DialogTitle, IconButton, } from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

import { ApprovalList } from './ApprovalList';
import { EventDialogTitle } from '../EventDialogTitle';

export function ApprovalDialog({ open, handleClose, event, userInfo }) {

  return (
    <Dialog
      className="dialog"
      open={open}
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
    >
      <DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <EventDialogTitle title={'APPROVALS FOR EVENT'} event={event} ></EventDialogTitle>
      </DialogTitle>
      <ApprovalList event={event} userInfo={userInfo}></ApprovalList>
    </Dialog>
  );
}
