import React, { useCallback, useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import CustomColumnResizeIcon from './CustomColumnResizeIcon';
import Constants from '../data/constants.json';

export default function ResizableGrid(props) {
  const { columns, ...other } = props;
  const [dataColumns, setDataColumns] = useState(columns);
  const widthChangedHandler = useCallback(
    (newWidth, columnIndex) => {
      setDataColumns((columns) => {
        const column = columns[columnIndex];

        column.width = newWidth;
        column.flex = 0;

        return columns.map((c) => ({ ...c }));
      });
    },
    [setDataColumns],
  );

  const ColumnResizeIcon = useCallback(() => {
    return <CustomColumnResizeIcon onWidthChanged={widthChangedHandler} id={other.id} />;
  }, [widthChangedHandler]);

  useEffect(() => {
    setDataColumns(columns);
  }, [columns]);

  return (
    <DataGrid
      sx={{ height: '98%' }}
      components={{
        ColumnResizeIcon: ColumnResizeIcon,
      }}
      componentsProps={{
        panel: {
          placement: 'auto',
        },
      }}
      columns={dataColumns}
      getRowHeight={() => {
        return Constants.GridRowHeight;
      }}
      {...other}
    />
  );
}
