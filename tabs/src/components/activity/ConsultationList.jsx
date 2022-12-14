import { React, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { Button, Box, Typography, Tabs, Tab, Link, Tooltip, Chip } from '@mui/material';

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
  const openConsultations = consultations.filter((c) => {
      return c.Closed >= new Date();
    }),
    reviewConsultations = consultations.filter((c) => {
      return c.Closed < new Date() && c.Deadline >= new Date();
    }),
    finalisedConsultations = consultations.filter((c) => {
      return c.Closed <= new Date();
    });

  const renderConsultationTitle = (params) => {
      return (
        <div>
          {params.row.Linktofolder && (
            <Link
              component="button"
              variant="body1"
              onClick={() => {
                params.row.Linktofolder && window.open(params.row.Linktofolder.Url, '_blank');
              }}
            >
              {params.row.Title}
            </Link>
          )}

          {!params.row.Linktofolder && (
            <Typography variant="body1" component={'span'}>
              {params.row.Title}
            </Typography>
          )}
        </div>
      );
    },
    renderGroupsTags = (params) => {
      let index = 0,
        groups = params.row.EionetGroups || [];

      return (
        <Tooltip title={groups.join(', ') || ''} arrow>
          <div id="test">
            {groups.map((m) => (
              <Chip key={index++} label={m} />
            ))}
          </div>
        </Tooltip>
      );
    },
    renderStartDate = (params) => {
      let dateFormat = configuration.DateFormatDashboard || 'dd-MMM-yyyy';
      return (
        <Typography variant="body1" component={'span'}>
          {format(params.row.Startdate, dateFormat)}
        </Typography>
      );
    },
    renderResults = (params) => {
      if (params.row.LinkToResults) {
        return (
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              params.row.LinkToResults && window.open(params.row.LinkToResults.Url, '_blank');
            }}
          >
            {params.row.LinkToResults.Description || 'Results'}
          </Button>
        );
      }
    };

  const baseColumns = [
    {
      field: 'Title',
      headerName: type,
      flex: 1.5,
      headerClassName: 'grid-header',
      renderCell: renderConsultationTitle,
    },
    {
      field: 'EionetGroups',
      headerName: 'Eionet groups',
      headerClassName: 'grid-header',
      renderCell: renderGroupsTags,
      flex: 1,
    },
    {
      field: 'Startdate',
      headerName: 'Start date',
      flex: 0.75,
      headerClassName: 'grid-header',
      renderCell: renderStartDate,
    },
  ];
  let openColumns = Array.from(baseColumns);
  openColumns.push({
    field: 'DaysLeft',
    headerName: 'Days left',
    flex: 0.75,
    headerClassName: 'grid-header',
  });
  let reviewColumns = Array.from(baseColumns);
  reviewColumns.push({
    field: 'DaysFinalised',
    headerName: 'Finalised in (days)',
    flex: 0.75,
    headerClassName: 'grid-header',
  });
  let finalisedColumns = Array.from(baseColumns);
  finalisedColumns.push({
    field: 'Results',
    headerName: 'Results',
    flex: 0.75,
    headerClassName: 'grid-header',
    renderCell: renderResults,
  });
  const [tabsValue, setTabsValue] = useState(0);

  const handleChange = (event, newValue) => {
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
        <Box sx={{ display: 'flex', height: '85%', width: '100%' }}>
          <Tabs value={tabsValue} onChange={handleChange} orientation="vertical">
            <Tab label={'Open(' + openConsultations.length + ')'} {...a11yProps(0)} />
            <Tab label={'Review(' + reviewConsultations.length + ')'} {...a11yProps(1)} />
            <Tab label={'Finalised(' + finalisedConsultations.length + ')'} {...a11yProps(2)} />
          </Tabs>
          <TabPanel className="tab-panel" value={tabsValue} index={0}>
            <DataGrid
              rows={openConsultations}
              columns={openColumns}
              pageSize={25}
              rowsPerPageOptions={[25]}
              hideFooterSelectedRowCount={true}
              getRowHeight={() => {
                return 36;
              }}
            />
          </TabPanel>
          <TabPanel className="tab-panel" value={tabsValue} index={1}>
            <DataGrid
              rows={reviewConsultations}
              columns={reviewColumns}
              pageSize={25}
              rowsPerPageOptions={[25]}
              hideFooterSelectedRowCount={true}
              getRowHeight={() => {
                return 36;
              }}
            />
          </TabPanel>
          <TabPanel className="tab-panel" value={tabsValue} index={2}>
            <DataGrid
              rows={finalisedConsultations}
              columns={finalisedColumns}
              pageSize={25}
              rowsPerPageOptions={[25]}
              hideFooterSelectedRowCount={true}
              getRowHeight={() => {
                return 36;
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
