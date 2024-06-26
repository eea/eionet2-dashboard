import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import ResizableGrid from '../ResizableGrid';

export function ManagementBoard({ users, mappings }) {
  const boardMappings = mappings.filter((mp) => {
      return mp.ManagementBoard;
    }),
    currentUsers = users
      .filter((u) => {
        return (
          u.NFP ||
          u.Membership?.some((m) => boardMappings.some((mapping) => mapping.Membership == m))
        );
      })
      .map((user) => {
        const boardMembership =
          user.NFP ||
          (user.Membership &&
            user.Membership.find((m) => boardMappings.some((mapping) => mapping.Membership == m)));
        return {
          id: user.id,
          Organisation: user.Organisation,
          Name: user.Title,
          Email: user.Email,
          BoardMembership: boardMembership,
          OtherMemberships: user.OtherMemberships,
          Membership: user.Membership,
        };
      }),
    renderOtherMemberships = (params) => {
      let index = 0,
        allMemberships = [];

      params.row.Membership?.forEach((m) => allMemberships.push(m));
      params.row.OtherMemberships?.forEach((m) => allMemberships.push(m));
      params.row.NFP && allMemberships.push(params.row.NFP);

      allMemberships = allMemberships.filter((m) => m != params.row.BoardMembership);

      return (
        <Tooltip title={allMemberships.join(', ') || ''} arrow>
          <div id="test">
            {allMemberships.map((m) => (
              <Chip variant="outlined" color="primary" key={index++} label={m} />
            ))}
          </div>
        </Tooltip>
      );
    };

  const columns = [
    {
      field: 'Organisation',
      headerName: 'Organisation',
      flex: 1.5,
    },
    {
      field: 'BoardMembership',
      headerName: 'Membership',
      flex: 0.75,
    },
    {
      field: 'Name',
      headerName: 'Name',
      flex: 0.75,
    },
    {
      field: 'Email',
      headerName: 'Email',
      flex: 0.75,
    },
    {
      field: 'OtherMemberships',
      headerName: 'Other Memberships',
      flex: 0.75,
      renderCell: renderOtherMemberships,
    },
  ];
  return (
    <Box className="grid-container">
      <ResizableGrid
        rows={currentUsers}
        columns={columns}
        pageSize={25}
        rowsPerPageOptions={[25]}
        hideFooterSelectedRowCount={true}
        initialState={{
          sorting: {
            sortModel: [
              {
                field: 'BoardMembership',
                sort: 'asc',
              },
            ],
          },
        }}
      ></ResizableGrid>
    </Box>
  );
}
