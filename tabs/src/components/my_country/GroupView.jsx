import { React, useEffect, useState } from 'react';
import './my_country.scss';
import ResizableGrid from '../ResizableGrid';
import { Avatar, Box, Chip, Divider, Typography, Backdrop, CircularProgress } from '@mui/material';
import { getADUserInfos } from '../../data/sharepointProvider';
import { UserCard } from './UserCard';

export function GroupView({ group }) {
  const [loading, setLoading] = useState(false),
    [groupLeads, setGroupLeads] = useState([]),
    [etcManagers, setEtcManagers] = useState([]),
    [isOtherMembership, setIsOtherMembership] = useState(false);
  const columns = [
    {
      field: 'Organisation',
      headerName: 'Organisation',
      flex: 1.5,
    },
    {
      field: 'Title',
      headerName: 'Name',
      flex: 0.75,
    },
    {
      field: 'Email',
      headerName: 'Email',
      flex: 0.75,
    },
  ];

  useEffect(() => {
    (async () => {
      setLoading(true);

      if (group) {
        setIsOtherMembership(group.OtherMembership);
        const leadsIds = group.EEAGroupLeadsIds
          ? group.EEAGroupLeadsIds.map((id) => {
              return id;
            })
          : [];
        group.ETCManagerIds && group.ETCManagerIds.forEach((id) => leadsIds.push(id));

        if (leadsIds && leadsIds.length > 0) {
          const userInfos = await getADUserInfos(leadsIds);
          const leads = userInfos.map((userInfo) => {
            return {
              ADUserId: userInfo.id,
              UserName: userInfo.displayName,
              Email: userInfo.mail,
              Company: userInfo.companyName,
              WorkPhone: userInfo.businessPhones.length > 0 ? userInfo.businessPhones[0] : '',
              JobTitle: userInfo.jobTitle,
              Department: userInfo.department,
              LookupId: userInfo.lookupId,
              ...(userInfo.base64Photo && {
                PhotoSrc: 'data:image/jpeg;base64, ' + userInfo.base64Photo,
              }),
            };
          });

          setGroupLeads(leads.filter((gl) => !group.ETCManagerIds.includes(gl.LookupId)));
          setEtcManagers(leads.filter((gl) => group.ETCManagerIds.includes(gl.LookupId)));
        } else {
          setGroupLeads([]);
          setEtcManagers([]);
        }
      } else {
        setGroupLeads([]);
        setEtcManagers([]);
      }
      setLoading(false);
    })();
  }, [group]);
  return (
    <Box
      sx={{
        display: 'flex',
        height: '97%',
        width: '100%',
      }}
    >
      {group && (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Box sx={{ marginLeft: '0.5rem', position: 'relative' }}>
            <Backdrop sx={{ color: 'primary.main', position: 'absolute' }} open={loading}>
              <CircularProgress size={20} color="primary" />
            </Backdrop>
            <Typography sx={{ fontWeight: 'bold' }} variant="h5" color="primary">
              {' '}
              {group.OfficialGroupName}
            </Typography>
            {groupLeads.length > 0 && (
              <Box>
                <Box sx={{ alignItems: 'center' }} className="cards-container">
                  <Typography color="primary" sx={{ marginRight: '5px', fontWeight: 'bold' }}>
                    {'EEA ' + (isOtherMembership ? 'ETC' : 'Group') + ' Lead:'}
                  </Typography>
                  {groupLeads.map((lead) => {
                    return <UserCard key={lead.id} userInfo={lead}></UserCard>;
                  })}
                </Box>
              </Box>
            )}
            {isOtherMembership && etcManagers.length > 0 && (
              <Box sx={{ alignItems: 'center', display: 'flex' }}>
                <Typography color="primary" sx={{ marginRight: '20px', fontWeight: 'bold' }}>
                  ETC Manager:
                </Typography>
                {etcManagers.map((lead) => {
                  return (
                    <Chip
                      variant="outlined"
                      color="primary"
                      key={lead.UserName}
                      className="chip"
                      label={lead.UserName}
                      sx={{ fontSize: '18px' }}
                      avatar={<Avatar alt={lead.UserName} src={lead.PhotoSrc}></Avatar>}
                    ></Chip>
                  );
                })}
              </Box>
            )}
          </Box>
          <Divider></Divider>
          <ResizableGrid
            id={group.GroupName}
            rows={group.Users}
            columns={columns}
            hideFooterSelectedRowCount
            pageSizeOptions={[25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
              sorting: {
                sortModel: [
                  {
                    field: 'Organisation',
                    sort: 'asc',
                  },
                ],
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}
