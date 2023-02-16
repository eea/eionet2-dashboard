import { React, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { Button, Box, Typography, Tabs, Tab, Link, Dialog, IconButton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { GroupsTags } from './GroupsTags';
import Constants from '../../data/constants.json';
import GradingIcon from '@mui/icons-material/Grading';
import CustomColumnResizeIcon from '../CustomColumnResizeIcon';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 1 }}>
          <Typography component={'span'}>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export function ConsultationList({ configuration, consultations, type }) {
  const [tagsCellOpen, setTagCellOpen] = useState(false),
    [selectedGroups, setSelectedGroups] = useState([]);
  const openConsultations = consultations.filter((c) => {
      return c.Closed >= new Date();
    }),
    reviewConsultations = consultations.filter((c) => {
      return c.Closed < new Date() && c.Deadline >= new Date();
    }),
    finalisedConsultations = consultations.filter((c) => {
      return c.Closed <= new Date() && c.Deadline < new Date();
    });

  const renderConsultationTitle = (params) => {
      return (
        <div>
          {params.row.Linktofolder && (
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
          )}

          {!params.row.Linktofolder && (
            <Typography
              className="grid-text"
              style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
              variant="body1"
              component={'span'}
            >
              {params.row.Title}
            </Typography>
          )}
        </div>
      );
    },
    renderGroupsTags = (params) => {
      return <GroupsTags handleClick={handleCellClick} groups={params.row.EionetGroups || []} />;
    },
    renderStartDate = (params) => {
      let dateFormat = configuration.DateFormatDashboard || 'dd-MMM-yyyy';
      return (
        <Typography className="grid-text" variant="body1" component={'span'}>
          {format(params.row.Startdate, dateFormat)}
        </Typography>
      );
    },
    renderDeadline = (params) => {
      let dateFormat = configuration.DateFormatDashboard || 'dd-MMM-yyyy';
      return (
        <Typography className="grid-text" variant="body1" component={'span'}>
          {format(params.row.Deadline, dateFormat)}
        </Typography>
      );
    },
    renderResults = (params) => {
      if (params.row.LinkToResults) {
        return (
          <IconButton
            variant="contained"
            color="success"
            onClick={() => {
              params.row.LinkToResults && window.open(params.row.LinkToResults, '_blank');
            }}
          >
            <GradingIcon />
          </IconButton>
        );
      }
    },
    renderCountryResponded = (params) => {
      return (
        <div className="grid-cell-centered">
          {params.row.HasUserCountryResponded && (
            <CheckCircleIcon color="success"></CheckCircleIcon>
          )}
        </div>
      );
    },
    handleCellClick = (groups) => {
      setTagCellOpen(true);
      setSelectedGroups(groups);
    },
    handleTagDialogClose = () => {
      setTagCellOpen(false);
    };

  const startDateColumn = {
      field: 'Startdate',
      headerName: 'Launch date',
      width: '100',
      renderCell: renderStartDate,
    },
    titleColumn = {
      field: 'Title',
      headerName: type,
      flex: 0.25,
      renderCell: renderConsultationTitle,
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
  const [tabsValue, setTabsValue] = useState(0);

  const handleChange = (_event, newValue) => {
    setTabsValue(newValue);
  };

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
        <Box sx={{ display: 'flex', height: '85%', width: '100%' }}>
          <Tabs value={tabsValue} onChange={handleChange} orientation="vertical">
            <Tab label={'Open(' + openConsultations.length + ')'} {...a11yProps(0)} />
            <Tab label={'Review(' + reviewConsultations.length + ')'} {...a11yProps(1)} />
            <Tab label={'Finalised(' + finalisedConsultations.length + ')'} {...a11yProps(2)} />
          </Tabs>
          <TabPanel className="tab-panel" value={tabsValue} index={0}>
            <DataGrid
              components={{
                ColumnResizeIcon: CustomColumnResizeIcon,
              }}
              rows={openConsultations}
              columns={openColumns}
              autoPageSize={true}
              hideFooterSelectedRowCount={true}
              getRowHeight={() => {
                return Constants.GridRowHeight;
              }}
              initialState={{
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
          </TabPanel>
          <TabPanel className="tab-panel" value={tabsValue} index={1}>
            <DataGrid
              components={{
                ColumnResizeIcon: CustomColumnResizeIcon,
              }}
              rows={reviewConsultations}
              columns={reviewColumns}
              autoPageSize={true}
              hideFooterSelectedRowCount={true}
              getRowHeight={() => {
                return Constants.GridRowHeight;
              }}
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
          </TabPanel>
          <TabPanel className="tab-panel" value={tabsValue} index={2}>
            <DataGrid
              components={{
                ColumnResizeIcon: CustomColumnResizeIcon,
              }}
              rows={finalisedConsultations}
              columns={finalisedColumns}
              autoPageSize={true}
              hideFooterSelectedRowCount={true}
              getRowHeight={() => {
                return Constants.GridRowHeight;
              }}
            />
          </TabPanel>
        </Box>
        <div className="bottom-panel">
          <Button
            variant="contained"
            onClick={() => {
              window.open(configuration.ConsultationListUrl, '_blank');
            }}
          >
            {'View all ' + type + 's'}
          </Button>
        </div>
      </Box>
    </div>
  );
}
