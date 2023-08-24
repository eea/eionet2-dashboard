import { React } from 'react';
import './my_country.scss';
import ResizableGrid from '../ResizableGrid';
import { Box } from '@mui/material';

export function GroupView({ group }) {
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
  return (
    <Box
      sx={{
        display: 'flex',
        height: '98%',
        width: '100%',
      }}
    >
      {group && (
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
      )}
    </Box>
  );
}
