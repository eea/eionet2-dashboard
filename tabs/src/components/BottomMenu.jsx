import React, { useState } from 'react';
import { useMediaQuery } from 'react-responsive';

import { Menu, MenuItem, Typography, Box, BottomNavigation, Button } from '@mui/material';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import './Tab.scss';
import Constants from '../data/constants.json';

export function BottomMenu({ configuration }) {
  const isMobile = useMediaQuery({ query: `(max-width: ${Constants.MobileMaxWidth})` }),
    [anchorEl, setAnchorEl] = useState(null),
    open = Boolean(anchorEl),
    handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    },
    handleClose = () => {
      setAnchorEl(null);
    },
    viewXmlFilter = '&useFiltersInViewXml=1',
    ecFilter = `&FilterFields2=IsECConsultation&FilterValues2=${encodeURIComponent(
      'Eionet-and-EC;#Eionet-only;#N/A',
    )}&FilterTypes2=Choice&FilterOp2=In`;

  return (
    <BottomNavigation sx={{ display: 'flex', justifyContent: 'flex-start', border: '2px' }}>
      {isMobile && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignSelf: 'center' }}>
          <Button
            id="basic-button"
            variant="outlined"
            aria-controls={open ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            className="details-btn"
            endIcon={<OpenInNewIcon color="primary" />}
            onClick={handleClick}
          >
            View details
          </Button>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            <MenuItem
              onClick={() => {
                window.open(configuration.ConsultationListUrl, '_blank');
                handleClose();
              }}
            >
              All consultations
            </MenuItem>
            <MenuItem
              onClick={() => {
                window.open(configuration.MeetingListUrl, '_blank');
                handleClose();
              }}
            >
              All events
            </MenuItem>
            <MenuItem
              onClick={() => {
                window.open(configuration.InquiryListUrl, '_blank');
                handleClose();
              }}
            >
              All enquiries
            </MenuItem>
            <MenuItem
              onClick={() => {
                window.open(configuration.OrganisationListUrl, '_blank');
                handleClose();
              }}
            >
              All organisations
            </MenuItem>
            <MenuItem
              onClick={() => {
                window.open(configuration.UserListUrl, '_blank');
                handleClose();
              }}
            >
              All users
            </MenuItem>
          </Menu>
        </Box>
      )}
      {!isMobile && (
        <Typography className="details-btn" color="tertiary">
          View details:
        </Typography>
      )}
      {!isMobile && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignSelf: 'center' }}>
          <Button
            className="bottom-button"
            color="tertiary"
            variant="outlined"
            endIcon={<OpenInNewIcon color="primary" />}
            onClick={() => {
              window.open(
                `${configuration.ConsultationListUrl}${viewXmlFilter}${ecFilter}`,
                '_blank',
              );
            }}
          >
            All consultations
          </Button>
          <Button
            className="bottom-button"
            color="tertiary"
            variant="outlined"
            endIcon={<OpenInNewIcon color="primary" />}
            onClick={() => {
              window.open(configuration.MeetingListUrl, '_blank');
            }}
          >
            All events
          </Button>

          <Button
            className="bottom-button"
            color="tertiary"
            variant="outlined"
            endIcon={<OpenInNewIcon color="primary" />}
            onClick={() => {
              window.open(`${configuration.InquiryListUrl}${viewXmlFilter}${ecFilter}`, '_blank');
            }}
          >
            All enquiries
          </Button>
          <Button
            className="bottom-button"
            color="tertiary"
            variant="outlined"
            endIcon={<OpenInNewIcon color="primary" />}
            onClick={() => {
              window.open(configuration.OrganisationListUrl, '_blank');
            }}
          >
            All organisations
          </Button>
          <Button
            className="bottom-button"
            color="tertiary"
            variant="outlined"
            endIcon={<OpenInNewIcon color="primary" />}
            onClick={() => {
              window.open(configuration.UserListUrl, '_blank');
            }}
          >
            All users
          </Button>
        </Box>
      )}
      <Typography
        align="center"
        sx={{
          position: 'absolute',
          right: 0,
          alignSelf: 'center',
          fontSize: '0.8rem',
          pr: '0.2rem',
        }}
      >
        v{`${process.env.REACT_APP_VERSION}`}
      </Typography>
    </BottomNavigation>
  );
}
