import { React } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import './my_country.scss';
import ResizableGrid from '../ResizableGrid';

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
        <AccordionSummary className="accordion-summary" expandIcon={<ExpandMoreIcon />}>
          <Typography className="accordion-summary-text">{groupName}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ overflowY: 'scroll' }}>
          <div id={groupName}>
            <ResizableGrid
              id={groupName}
              className="data-grid"
              rows={users}
              columns={columns}
              hideFooterSelectedRowCount={true}
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
