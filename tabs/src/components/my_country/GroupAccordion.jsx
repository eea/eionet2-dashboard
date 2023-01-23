import { React } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import './my_country.css';

export function GroupAccordion({ groupName, users }) {
  const columns = [
    {
      field: 'Organisation',
      headerName: 'Organisation',
      flex: 1.5,
      headerClassName: 'grid-header',
    },
    {
      field: 'Title',
      headerName: 'Name',
      flex: 0.75,
      headerClassName: 'grid-header',
    },
    {
      field: 'Email',
      headerName: 'Email',
      flex: 0.75,
      headerClassName: 'grid-header',
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
              rows={users}
              columns={columns}
              hideFooterSelectedRowCount={true}
              getRowHeight={() => {
                return 36;
              }}
              autoHeight={true}
              hideFooter={true}
            />
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
