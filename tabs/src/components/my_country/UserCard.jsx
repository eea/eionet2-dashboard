import { React } from 'react';
import { Avatar, Box, CardContent, Card, Typography, Chip } from '@mui/material';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';

export function UserCard({ userInfo }) {
  return (
    <Card sx={{ marginTop: '0.2rem', marginBottom: '0.5rem' }} variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex' }}>
          <Avatar
            sx={{ margin: '0.5rem', width: 64, height: 64 }}
            alt={userInfo.UserName}
            src={userInfo.PhotoSrc}
          ></Avatar>
          <Box>
            <Typography variant="h6">{userInfo.UserName}</Typography>
            <Typography sx={{ fontSize: '14px' }}>{userInfo.JobTitle}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          {userInfo.WorkPhone && (
            <Chip icon={<LocalPhoneOutlinedIcon />} label={userInfo.WorkPhone}></Chip>
          )}
          {userInfo.Email && <Chip icon={<EmailOutlinedIcon />} label={userInfo.Email}></Chip>}
          {userInfo.Department && (
            <Chip icon={<GroupOutlinedIcon />} label={userInfo.Department}></Chip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
