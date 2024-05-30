import React, { useEffect, useState } from 'react';
import './my_country.scss';
import { Box, Typography, Backdrop, CircularProgress } from '@mui/material';
import { getADUserInfos } from '../../data/sharepointProvider';
import { UserCard } from './UserCard';

export function CountryMembers({ countryInfo }) {
  const [loading, setLoading] = useState(false),
    [leads, setLeads] = useState([]),
    [members, setMembers] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);

      setLeads([]);
      setMembers([]);

      if (countryInfo) {
        const memberIds = countryInfo.CDO
          ? countryInfo.CDO.map((m) => {
              return m.LookupId;
            })
          : [];

        countryInfo.TeamMember?.forEach((m) => memberIds.push(m.LookupId));

        if (memberIds?.length > 0) {
          const userInfos = await getADUserInfos(memberIds);
          const members = userInfos
            .filter((ui) => !!ui)
            .map((userInfo) => {
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

          setLeads(members.filter((gl) => countryInfo.CDO.some((m) => m.LookupId == gl.LookupId)));
          setMembers(
            members.filter((gl) => countryInfo.TeamMember.some((m) => m.LookupId == gl.LookupId)),
          );
        }
      }
      setLoading(false);
    })();
  }, [countryInfo]);

  return (
    <Box className="grid-container">
      {countryInfo && (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Box sx={{ position: 'relative', height: '100%' }}>
            <Backdrop invisible sx={{ color: 'primary.main', position: 'absolute' }} open={loading}>
              <CircularProgress color="primary" />
            </Backdrop>
            {leads.length > 0 && (
              <Box sx={{ pt: '12px', pl: '12px' }}>
                <Typography color="text.secondary" className="subtitle">
                  {'Country desk officer for ' + countryInfo.CountryName}
                </Typography>
                <Box sx={{ alignItems: 'center' }} className="cards-container">
                  {leads.map((lead) => {
                    return <UserCard key={lead.id} showAvatar={true} userInfo={lead}></UserCard>;
                  })}
                </Box>
              </Box>
            )}
            {members.length > 0 && (
              <Box sx={{ pt: '12px', pl: '12px' }}>
                <Typography color="text.secondary" className="subtitle">
                  Country desk officer team members
                </Typography>
                <Box sx={{ alignItems: 'center' }} className="cards-container">
                  {members.map((member) => {
                    return (
                      <UserCard key={member.id} showAvatar={true} userInfo={member}></UserCard>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
