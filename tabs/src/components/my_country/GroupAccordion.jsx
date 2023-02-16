import { React } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import './my_country.scss';
import Constants from '../../data/constants.json';
import CustomColumnResizeIcon from '../CustomColumnResizeIcon';

export function GroupAccordion({ groupName, users }) {
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
    <div>
      <Accordion className="accordion">
        <AccordionSummary
          className="accordion-summary"
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography className="accordion-summary-text">{groupName}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ overflowY: 'scroll' }}>
          <div>
            <DataGrid
              components={{
                ColumnResizeIcon: CustomColumnResizeIcon,
              }}
              className="data-grid"
              rows={users}
              columns={columns}
              hideFooterSelectedRowCount={true}
              getRowHeight={() => {
                return Constants.GridRowHeight;
              }}
              autoHeight={true}
              hideFooter={true}
              initialState={{
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
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
