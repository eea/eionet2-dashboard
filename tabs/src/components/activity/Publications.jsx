import { React } from 'react';

import { Box, Typography, Chip, Tooltip } from '@mui/material';

import { format } from 'date-fns';

import ResizableGrid from '../ResizableGrid';

export function PublicatonList({
  userInfo,
  configuration,
  futurePublications,
  pastPublications,
  tabsValue,
}) {
  const renderDate = (params) => {
      let dateFormat = configuration.DateFormatDashboard;
      return (
        <Typography
          sx={{ whiteSpace: 'pre-line' }}
          className="grid-text"
          variant="body1"
          component={'span'}
        >
          {params.row.Date && format(params.row.Date, dateFormat)}
        </Typography>
      );
    },
    renderChips = (params) => {
      let index = 0;
      const products = params.row.ExtraCommsProducts;
      return (
        <Tooltip title={products.join(', ') || ''} arrow>
          <div id="test">
            {products.map((m) => (
              <Chip variant="outlined" color="primary" key={index++} label={m} />
            ))}
          </div>
        </Tooltip>
      );
    };

  const gridColumns = [
    {
      field: 'Title',
      headerName: 'Event',
      flex: 1,
    },
    {
      field: 'ItemType',
      headerName: 'Type',
      flex: 0.5,
    },
    {
      field: 'ExtraCommsProducts',
      headerName: 'Products',
      renderCell: renderChips,
      flex: 0.5,
    },
    {
      field: 'Status',
      headerName: 'Status',
      width: '130',
    },
    {
      field: 'Date',
      headerName: 'Date',
      width: '130',
      renderCell: renderDate,
    },
  ];

  return (
    <div className="">
      <Box
        sx={{
          boxShadow: 2,
        }}
      >
        <Box className="grid-container">
          {tabsValue == 0 && (
            <ResizableGrid
              rows={futurePublications}
              columns={gridColumns}
              pageSizeOptions={[25, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
                sorting: {
                  sortModel: [
                    {
                      field: 'Date',
                      sort: 'desc',
                    },
                  ],
                },
              }}
              hideFooterSelectedRowCount
            />
          )}
          {tabsValue == 1 && (
            <ResizableGrid
              rows={pastPublications}
              columns={gridColumns}
              hideFooterSelectedRowCount
              pageSizeOptions={[25, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
                sorting: {
                  sortModel: [
                    {
                      field: 'Date',
                      sort: 'desc',
                    },
                  ],
                },
              }}
            />
          )}
        </Box>
        {false && <span>{userInfo.toString()}</span>}
      </Box>
    </div>
  );
}
