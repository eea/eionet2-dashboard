import React, { useCallback, useState } from 'react';
import { format } from 'date-fns';
import { Button, Box, Typography, Link, Dialog, IconButton, Tooltip } from '@mui/material';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GradingIcon from '@mui/icons-material/Grading';

import { GroupsTags } from './GroupsTags';
import ResizableGrid from '../ResizableGrid';

export function ConsultationList({
  configuration,
  openConsultations,
  reviewConsultations,
  finalisedConsultations,
  futureConsultations,
  type,
  country,
  tabsValue,
}) {
  const [tagsCellOpen, setTagCellOpen] = useState(false),
    [selectedGroups, setSelectedGroups] = useState([]);

  const renderConsultationTitle = (params) => {
      return (
        <Box>
          {params.row.Linktofolder && (
            <Tooltip title={params.row.Title}>
              <Link
                className="grid-text"
                style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                component="button"
                variant="body1"
                onClick={() => {
                  params.row.Linktofolder && window.open(params.row.Linktofolder, '_blank');
                }}
              >
                {params.row.Title}
              </Link>
            </Tooltip>
          )}

          {!params.row.Linktofolder && (
            <Tooltip title={params.row.Title}>
              <Typography
                className="grid-text"
                style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                variant="body1"
                component={'span'}
              >
                {params.row.Title}
              </Typography>
            </Tooltip>
          )}
        </Box>
      );
    },
    renderDocument = (params) => {
      return (
        <Tooltip title="See details">
          <IconButton
            variant="contained"
            color="primary"
            onClick={() => {
              params.row.ItemLink && window.open(params.row.ItemLink, '_blank');
            }}
          >
            <AssignmentIcon></AssignmentIcon>
          </IconButton>
        </Tooltip>
      );
    },
    renderGroupsTags = (params) => {
      return <GroupsTags handleClick={handleCellClick} groups={params.row.EionetGroups || []} />;
    },
    renderDate = (date) => {
      let dateFormat = configuration.DateFormatDashboard || 'dd-MMM-yyyy';
      return (
        <Typography className="grid-text" variant="body1" component={'span'}>
          {format(date, dateFormat)}
        </Typography>
      );
    },
    renderStartDate = (params) => {
      return renderDate(params.row.Startdate);
    },
    renderDeadline = (params) => {
      return renderDate(params.row.Deadline);
    },
    renderResults = (params) => {
      if (params.row.LinkToResults) {
        return (
          <Tooltip title={configuration.ConsultationResultsTooltip}>
            <IconButton
              variant="contained"
              color="success"
              onClick={() => {
                params.row.LinkToResults && window.open(params.row.LinkToResults, '_blank');
              }}
            >
              <GradingIcon />
            </IconButton>
          </Tooltip>
        );
      }
    },
    renderCountryResponded = (params) => {
      if (country) {
        return (
          <div>
            {params.row.HasUserCountryResponded && (
              <Tooltip title={configuration.CountryRespondedTooltip}>
                <TaskAltIcon color="success"></TaskAltIcon>
              </Tooltip>
            )}
          </div>
        );
      } else {
        return (
          <div>
            <Typography className="grid-text" variant="body1" component={'span'}>
              {params.row.Respondants.length}
            </Typography>
          </div>
        );
      }
    },
    handleCellClick = useCallback(
      (groups) => {
        setTagCellOpen(true);
        setSelectedGroups(groups);
      },
      [tagsCellOpen, selectedGroups],
    ),
    handleTagDialogClose = useCallback(() => {
      setTagCellOpen(false);
    }, [tagsCellOpen]);

  const startDateColumn = {
      field: 'Startdate',
      headerName: 'Launch date',
      width: '100',
      renderCell: renderStartDate,
    },
    titleColumn = {
      field: 'Title',
      headerName: type,
      flex: 0.75,
      renderCell: renderConsultationTitle,
    },
    documentColumn = {
      field: 'Closed',
      headerName: 'Details',
      width: '100',
      align: 'center',
      renderCell: renderDocument,
    },
    groupsColumn = {
      field: 'EionetGroups',
      headerName: 'Eionet groups',
      renderCell: renderGroupsTags,
      flex: 0.5,
    },
    countryRespondedColumn = {
      field: 'HasUserCountryResponded',
      headerName: 'Responded',
      renderCell: renderCountryResponded,
      align: 'center',
      width: '100',
    };

  const getCellColor = (params) => {
    if (params.value < 3) {
      return 'red-cell-text';
    }
  };

  let openColumns = [];
  openColumns.push(titleColumn);
  openColumns.push(documentColumn);
  openColumns.push(groupsColumn);
  openColumns.push(startDateColumn);
  openColumns.push({
    field: 'DaysLeft',
    headerName: 'Days left',
    width: '100',
    align: 'center',
    cellClassName: (params) => {
      return getCellColor(params);
    },
  });
  openColumns.push(countryRespondedColumn);

  let reviewColumns = [];
  reviewColumns.push(titleColumn);
  reviewColumns.push(documentColumn);
  reviewColumns.push(groupsColumn);
  reviewColumns.push(startDateColumn);
  reviewColumns.push({
    field: 'DaysFinalised',
    headerName: 'Finalised in (days)',
    width: '170',
    align: 'center',
    cellClassName: (params) => {
      return getCellColor(params);
    },
  });
  reviewColumns.push(countryRespondedColumn);

  let finalisedColumns = [];
  finalisedColumns.push(titleColumn);
  finalisedColumns.push(documentColumn);
  finalisedColumns.push(groupsColumn);
  finalisedColumns.push({
    field: 'Deadline',
    headerName: 'Deadline',
    width: '100',
    renderCell: renderDeadline,
  });
  finalisedColumns.push(countryRespondedColumn);
  finalisedColumns.push({
    field: 'Results',
    headerName: 'Results',
    width: '75',
    align: 'center',
    renderCell: renderResults,
  });

  let futureColumns = [];
  futureColumns.push(titleColumn);
  futureColumns.push(documentColumn);
  futureColumns.push(groupsColumn);
  futureColumns.push({
    field: 'Startdate',
    headerName: 'Expected launch date',
    width: '190',
    align: 'center',
    renderCell: renderStartDate,
  });
  return (
    <div className="">
      {false && <span>{configuration.toString()}</span>}
      <Box
        sx={{
          boxShadow: 2,
        }}
      >
        <Dialog open={tagsCellOpen} onClose={handleTagDialogClose} maxWidth="xl">
          <GroupsTags groups={selectedGroups} isDialog={true} />
          <Button
            onClick={handleTagDialogClose}
            sx={{ alignSelf: 'end', marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            Close
          </Button>
        </Dialog>
        <Box className="grid-container">
          {tabsValue == 0 && (
            <ResizableGrid
              rows={futureConsultations}
              columns={futureColumns}
              pageSizeOptions={[25, 50, 100]}
              hideFooterSelectedRowCount={true}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
                sorting: {
                  sortModel: [
                    {
                      field: 'Startdate',
                      sort: 'asc',
                    },
                  ],
                },
              }}
            />
          )}
          {tabsValue == 1 && (
            <ResizableGrid
              rows={openConsultations}
              columns={openColumns}
              hideFooterSelectedRowCount={true}
              pageSizeOptions={[25, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
                sorting: {
                  sortModel: [
                    {
                      field: 'DaysLeft',
                      sort: 'asc',
                    },
                  ],
                },
              }}
            />
          )}
          {tabsValue == 2 && (
            <ResizableGrid
              rows={reviewConsultations}
              columns={reviewColumns}
              pageSizeOptions={[25, 50, 100]}
              hideFooterSelectedRowCount={true}
              initialState={{
                sorting: {
                  sortModel: [
                    {
                      field: 'DaysFinalised',
                      sort: 'asc',
                    },
                  ],
                },
              }}
            />
          )}
          {tabsValue == 3 && (
            <ResizableGrid
              rows={finalisedConsultations}
              columns={finalisedColumns}
              pageSizeOptions={[25, 50, 100]}
              hideFooterSelectedRowCount={true}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
                sorting: {
                  sortModel: [
                    {
                      field: 'Deadline',
                      sort: 'desc',
                    },
                  ],
                },
              }}
            />
          )}
        </Box>
      </Box>
    </div>
  );
}
