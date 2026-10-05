import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Link,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useMediaQuery } from 'react-responsive';
import { format } from 'date-fns';
import Constants from '../../data/constants.json';

const headerHeight = 58;

export function CardColumns({ columns, dateFormat }) {
  const isMobile = useMediaQuery({ query: `(max-width: ${Constants.MobileMaxWidth})` }),
    hasDates = columns.some((column) => column.items.some((item) => item.Date)),
    renderName = (params) => {
      const item = params.row;
      return (
        <Tooltip title={item.Name}>
          <Box className="grid-cell">
            {item.Link && (
              <Link
                className="grid-text"
                style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                component="button"
                variant="body1"
                onClick={() => {
                  window.open(item.Link, '_blank');
                }}
              >
                {item.Name}
              </Link>
            )}
            {!item.Link && (
              <Typography
                className="grid-text"
                style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                variant="body1"
                component={'span'}
              >
                {item.Name}
              </Typography>
            )}
          </Box>
        </Tooltip>
      );
    },
    renderDate = (params) => {
      return (
        <Typography className="grid-text" variant="body1" component={'span'}>
          {params.row.Date && format(params.row.Date, dateFormat || 'dd-MMM-yyyy')}
        </Typography>
      );
    },
    renderGrid = (column) => {
      const gridColumns = [
        {
          field: 'Name',
          headerName: column.title,
          flex: 1,
          renderCell: renderName,
        },
      ];
      hasDates &&
        gridColumns.push({
          field: 'Date',
          headerName: 'Date',
          type: 'date',
          width: 120,
          renderCell: renderDate,
        });

      //the grid scrolls on its own, which keeps the header row pinned
      const bodyHeight = Math.max(column.items.length * Constants.GridRowHeight, 60),
        gridHeight = `min(60vh, ${bodyHeight + headerHeight}px)`;

      return (
        <DataGrid
          sx={{ height: gridHeight }}
          rows={column.items}
          columns={gridColumns}
          getRowHeight={() => {
            return Constants.GridRowHeight;
          }}
          hideFooter
          initialState={{
            pagination: { paginationModel: { pageSize: 100 } },
          }}
        />
      );
    };

  if (isMobile) {
    return (
      <Box className="card-columns-mobile">
        {columns.map((column, index) => {
          return (
            <Accordion key={column.title} defaultExpanded={index === 0}>
              <AccordionSummary className="accordion-summary" expandIcon={<ExpandMoreIcon />}>
                <Typography className="accordion-summary-text">
                  {column.title} ({column.items.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails className="card-accordion-details">
                {renderGrid(column)}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    );
  }

  return (
    <Box className="card-columns">
      {columns.map((column) => {
        return (
          <Box className="card-column" key={column.title}>
            {renderGrid(column)}
          </Box>
        );
      })}
    </Box>
  );
}
