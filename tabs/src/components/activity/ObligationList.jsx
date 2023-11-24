import { React } from 'react';

import { Box, Typography, Link } from '@mui/material';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

import { format } from 'date-fns';

import ResizableGrid from '../ResizableGrid';
import { HtmlBox } from '../HtmlBox';

export function ObligationList({
  userInfo,
  configuration,
  upcomingObligations,
  continousObligations,
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
          {params.row.Deadline && format(params.row.Deadline, dateFormat)}
        </Typography>
      );
    },
    renderCoreEEAFlow = (params) => {
      return <div>{params.row.IsEEACore && <TaskAltIcon color="success"></TaskAltIcon>}</div>;
    },
    renderTitle = (params) => {
      return renderUrl(params.row.Url, params.row.Title);
    },
    renderInstrument = (params) => {
      return renderUrl(params.row.InstrumentUrl, params.row.Instrument);
    },
    renderReportTo = (params) => {
      return renderUrl(params.row.ReportToUrl, params.row.ReportTo);
    },
    renderUrl = (url, title) => {
      return (
        <Box>
          <Link
            className="grid-text"
            style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
            component="button"
            variant="body1"
            onClick={() => {
              url && window.open(url, '_blank');
            }}
          >
            {title}
          </Link>
        </Box>
      );
    };

  const gridColumns = [
    {
      field: 'Title',
      headerName: 'Obligation',
      renderCell: renderTitle,
      flex: 1,
    },
    {
      field: 'Instrument',
      headerName: 'Instrument',
      renderCell: renderInstrument,
      flex: 1,
    },
    {
      field: 'Deadline',
      headerName: 'Deadline',
      width: '110',
      renderCell: renderDate,
    },
    {
      field: 'ReportTo',
      headerName: 'Report to',
      renderCell: renderReportTo,
      flex: 0.5,
    },
    {
      field: 'IsEEACore',
      headerName: 'Core data flow',
      renderCell: renderCoreEEAFlow,
      align: 'center',
      width: '120',
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
        {configuration?.ReportingObligationsIntroText && (
          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <HtmlBox html={configuration?.ReportingObligationsIntroText}></HtmlBox>
          </Box>
        )}
        <Box className="grid-container">
          {tabsValue == 0 && (
            <ResizableGrid
              rows={upcomingObligations}
              columns={gridColumns}
              pageSizeOptions={[25, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
                sorting: {
                  sortModel: [
                    {
                      field: 'Deadline',
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
              rows={continousObligations}
              columns={gridColumns}
              hideFooterSelectedRowCount
              pageSizeOptions={[25, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
                sorting: {
                  sortModel: [
                    {
                      field: 'Instrument',
                      sort: 'asc',
                    },
                    {
                      field: 'Title',
                      sort: 'asc',
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
