import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Alert, Box, Backdrop, CircularProgress, Typography, Link, Divider } from '@mui/material';
import { getFlows } from '../../data/reportingProvider';
import ResizableGrid from '../ResizableGrid';
import { HtmlBox } from '../HtmlBox';

export function DataReporters({ configuration, country, users }) {
  const [loading, setLoading] = useState(false),
    [flows, setFlows] = useState([]);

  const coordinatorsText = users
    .filter((u) => u.AllMemberships.includes(configuration?.DataflowCoordinatorsTag))
    ?.map((u) => u.Title)
    .join(', ');

  useEffect(() => {
    (async () => {
      setLoading(true);

      const response = await getFlows(country);

      setFlows(response);
      setLoading(false);
    })();
  }, [country]);

  const renderTitle = (params) => {
      const record = params.row;
      const recordData = [];
      recordData.push({
        id: 0,
        name: record.dataflowName,
        url: record.dataflowURL,
      });
      recordData.push({
        id: 1,
        name: record.obligationName,
        url: record.obligationURL,
      });
      recordData.push({
        id: 2,
        name: record.legalInstrumentName,
        url: record.legalInstrumentURL,
      });

      return (
        <Box>
          <ul style={{ padding: 0, listStyle: 'none' }}>
            {recordData.map((rd) => {
              return (
                <li key={rd.id}>
                  {rd.url && (
                    <Link
                      className="grid-text"
                      component="button"
                      variant="body1"
                      onClick={() => {
                        rd.url && window.open(rd.url, '_blank');
                      }}
                    >
                      {rd.name}
                    </Link>
                  )}
                  {!rd.url && (
                    <Typography className="grid-text" variant="body1" component={'span'}>
                      {rd.name}
                    </Typography>
                  )}
                </li>
              );
            })}
          </ul>
        </Box>
      );
    },
    renderDate = (params) => {
      let dateFormat = configuration.DateFormatDashboard || 'dd-MMM-yyyy';
      return (
        <Typography className="grid-text" variant="body1" component={'span'}>
          {format(params.row.deadlineDate, dateFormat)}
        </Typography>
      );
    },
    renderReleaseDate = (params) => {
      const record = params.row;
      let dateFormat = configuration.DateFormatDashboard || 'dd-MMM-yyyy';
      return (
        <Box>
          {record.firstReleaseDate && (
            <Typography
              style={{ display: 'inline-block' }}
              className="grid-text"
              variant="body1"
              component={'span'}
            >
              {format(record.firstReleaseDate, dateFormat)}
              {'(first)'}
            </Typography>
          )}
          {record.lastReleaseDate && (
            <Typography
              style={{ display: 'inline-block' }}
              className="grid-text"
              variant="body1"
              component={'span'}
            >
              {format(record.lastReleaseDate, dateFormat)}
              {'(latest)'}
            </Typography>
          )}
        </Box>
      );
    },
    renderReporters = (params) => {
      const record = params.row;
      return (
        <Box style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
          {record.reporterEmails.map((email) => {
            return (
              <Link key={email} sx={{ color: 'secondary.main' }} href={`mailto:${email}`}>
                {email}
                {'; '}
              </Link>
            );
          })}
        </Box>
      );
    };

  const gridColumns = [
    {
      field: 'dataflowName',
      headerName: 'Dataflow / Obligation / Legal instrument',
      flex: 1,
      renderCell: renderTitle,
    },
    {
      field: 'emails',
      headerName: 'Reporters',
      flex: 1,
      renderCell: renderReporters,
    },
    {
      field: 'deadlineDate',
      headerName: 'Deadline',
      width: '130',
      renderCell: renderDate,
    },
    {
      field: 'firstReleaseDate',
      headerName: 'Release date',
      width: '180',
      renderCell: renderReleaseDate,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: '100',
    },
    {
      field: 'deliveryStatus',
      headerName: 'Delivery status',
      width: '150',
    },
  ];

  return (
    <>
      {country && (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
          <Box sx={{ position: 'relative' }}>
            <Backdrop
              sx={{ color: 'primary.main', zIndex: (theme) => theme.zIndex.drawer + 1 }}
              open={loading}
            >
              <CircularProgress color="primary" />
            </Backdrop>
            {coordinatorsText && (
              <Box>
                <Box sx={{ alignItems: 'center' }} className="cards-container">
                  <Typography color="primary" sx={{ marginRight: '5px', fontWeight: 'bold' }}>
                    {`National Dataflow Coordinator: ${coordinatorsText}`}
                  </Typography>
                </Box>
              </Box>
            )}
            <Divider></Divider>
            <Box sx={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
              <Alert sx={{ fontWeight: 'bold' }} severity="info">
                <HtmlBox html={configuration?.ReportingInfoText}></HtmlBox>
              </Alert>
            </Box>
            <Divider></Divider>
          </Box>
          <Box className="grid-container">
            <ResizableGrid
              rows={flows}
              columns={gridColumns}
              pageSizeOptions={[25, 50, 100]}
              getRowHeight={() => 'auto'}
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
          </Box>
        </Box>
      )}
    </>
  );
}
