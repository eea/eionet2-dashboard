import { React } from 'react';

import { Box, Typography, Chip, Tooltip } from '@mui/material';

import { format } from 'date-fns';

import ResizableGrid from '../ResizableGrid';
import { HtmlBox } from '../HtmlBox';

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
    renderProducts = (params) => {
      return renderChips(params.row.ExtraCommsProducts);
    },
    renderChips = (data) => {
      let index = 0;
      if (data && data.length) {
        return (
          <Tooltip title={data.join(', ') || ''} arrow>
            <div id="chipContainer">
              {data.map((m) => (
                <Chip variant="outlined" color="primary" key={index++} label={m} />
              ))}
            </div>
          </Tooltip>
        );
      }
    };

  const gridColumns = [
    {
      field: 'Title',
      headerName: 'Title',
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
      renderCell: renderProducts,
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
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {configuration?.PublicationsIntroText && (
          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <HtmlBox html={configuration?.PublicationsIntroText}></HtmlBox>
          </Box>
        )}
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
                      sort: 'asc',
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
