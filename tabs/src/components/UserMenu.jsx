import { useState, React, useCallback } from 'react';
import { Badge, Box, Button, Menu, MenuItem, Divider, Typography } from '@mui/material';

import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import PortraitIcon from '@mui/icons-material/Portrait';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import ReviewsOutlinedIcon from '@mui/icons-material/ReviewsOutlined';

export function UserMenu({
  userInfo,
  openSelfService,
  events2Rate,
  events2Approve,
  openRating,
  openApproval,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = useCallback(
      (event) => {
        setAnchorEl(event.currentTarget);
      },
      [anchorEl],
    ),
    handleSelfService = () => {
      openSelfService();
      handleClose();
    },
    handleClose = () => {
      setAnchorEl(null);
    };

  return (
    <Box>
      <Button
        className="user-menu-button"
        aria-controls={open ? 'demo-customized-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        variant="outline"
        color="secondary"
        disableElevation
        endIcon={
          <Badge
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            badgeContent={events2Rate.length + (userInfo.isNFP ? events2Approve.length : 0)}
            color="primary"
          >
            <PortraitIcon color="secondary.main" />
          </Badge>
        }
        onClick={handleClick}
      >
        {userInfo.displayName}
      </Button>
      <Menu
        id="demo-customized-menu"
        MenuListProps={{
          'aria-labelledby': 'demo-customized-button',
        }}
        PaperProps={{
          style: {
            width: 300,
          },
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem className="menu-item" onClick={handleSelfService} disableRipple>
          <ManageAccountsOutlinedIcon color="primary" className="menu-icon" />
          Edit my profile
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem className="menu-item" disableRipple>
          <ReviewsOutlinedIcon color="primary" className="menu-icon" />
          Rate Event
        </MenuItem>
        {events2Rate.map((e) => (
          <MenuItem key={e.id} onClick={() => openRating(e)} disableRipple>
            <Typography className="grid-text" variant="inherit" noWrap>
              {e.Title}
            </Typography>
          </MenuItem>
        ))}
        <Divider sx={{ my: 0.5 }} />
        {userInfo.isNFP && (
          <MenuItem className="menu-item" disableRipple>
            <FactCheckOutlinedIcon className="menu-icon" />
            Approve
          </MenuItem>
        )}
        {userInfo.isNFP &&
          events2Approve.map((e) => (
            <MenuItem key={e.id} onClick={() => openApproval(e)} disableRipple>
              <Typography className="grid-text" variant="inherit" noWrap>
                {e.Title}
              </Typography>
            </MenuItem>
          ))}
      </Menu>
    </Box>
  );
}
