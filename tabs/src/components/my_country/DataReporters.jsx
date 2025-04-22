import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  Alert,
  Box,
  Backdrop,
  CircularProgress,
  Typography,
  Link,
  Divider,
  Chip,
} from '@mui/material';
import { getFlows } from '../../data/reportingProvider';
import ResizableGrid from '../ResizableGrid';
import { HtmlBox } from '../HtmlBox';

import { Insights, Handshake, Gavel } from '@mui/icons-material';

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
            const id = rd.id;
            return (
              <Box key={id} sx={{ display: 'flex', paddingBottom: '0.25rem' }}>
                {id == 0 && <Insights></Insights>}
                {id == 1 && <Handshake></Handshake>}
                {id == 2 && <Gavel></Gavel>}
                {rd.url && (
                  <Link
                    className="grid-text"
                    component="button"
                    variant="body1"
                    sx={{
                      fontWeight: id == 0 ? 'bold' : 'normal',
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
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
              </Box>
            );
          })}
        </ul>
      </Box>
    );
  },
    renderTitleHeader = () => {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'row' }} >
          <Insights></Insights>
          <Typography sx={{ fontWeight: 'bold', paddingRight: '1rem' }} className="grid-text" variant="body1" component={'span'}>
            {'Dataflow'}
          </Typography>
          <Handshake></Handshake>
          <Typography sx={{ fontWeight: 'bold', paddingRight: '1rem' }} className="grid-text" variant="body1" component={'span'}>
            {'Obligation'}
          </Typography>
          <Gavel></Gavel>
          <Typography sx={{ fontWeight: 'bold' }} className="grid-text" variant="body1" component={'span'}>
            {'Legal instrument'}
          </Typography>

        </Box >
      )
    },
    renderDate = (params) => {
      let dateFormat = configuration.DateFormatDashboard || 'dd-MMM-yyyy';
      return (
        <>
          {params.row.deadlineDate && (
            <Typography className="grid-text" variant="body1" component={'span'}>
              {format(params.row.deadlineDate, dateFormat)}
            </Typography>
          )}
        </>
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
        <Box>
          {record.reporterEmails.map((email) => {
            return (
              <Chip
                variant="outlined"
                color="primary"
                label={email}
                key={email}
                sx={{ color: 'secondary.main' }}
                href={`mailto:${email}`}
                component="a"
                clickable
              />
            );
          })}
        </Box>
      );
    };

  const gridColumns = [
    {
      field: 'dataflowName',
      //headerName: 'Dataflow / Obligation / Legal instrument',
      flex: 1,
      renderHeader: renderTitleHeader,
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
      headerName: 'Dataflow status',
      width: '125',
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
