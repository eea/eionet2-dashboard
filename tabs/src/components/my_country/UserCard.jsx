import { React } from 'react';
import { Avatar, Box, CardContent, Card, Typography, Chip } from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

export function UserCard({ userInfo, showAvatar }) {
  return (
    <Card sx={{ marginTop: '0.2rem', marginBottom: '0.5rem' }} variant="outlined">
      <CardContent sx={{ padding: '7px', '&:last-child': { pb: 0 } }} className="card-content">
        <Box sx={{ display: 'flex' }}>
          {showAvatar && (
            <Avatar
              sx={{ margin: '0.5rem', width: 64, height: 64 }}
              alt={userInfo.UserName}
              src={userInfo.PhotoSrc}
            ></Avatar>
          )}
          <Box sx={{ alignSelf: 'center' }}>
            <Typography variant="h6">{userInfo.UserName}</Typography>
            {userInfo.Email && <Chip icon={<EmailOutlinedIcon />} label={userInfo.Email}></Chip>}
            {userInfo.Organisation && (
              <Chip icon={<EmailOutlinedIcon />} label={userInfo.Organisation}></Chip>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
