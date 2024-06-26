import React, { useCallback, useEffect, useState } from 'react';
import { GridSeparatorIcon } from '@mui/x-data-grid';

export default function CustomColumnResizeIcon({ onWidthChanged, id }) {
  const headerSelector = "[role='columnheader'][tabindex='0']";

  const [initialPos, setInitialPos] = useState(null),
    [resizeInfo, setResizeInfo] = useState(null),
    [initialSize, setInitialSize] = useState(null);

  const initial = useCallback((e) => {
    let resizable = id
      ? document.getElementById(id).querySelector(headerSelector)
      : document.querySelector(headerSelector);

    setInitialPos(e.clientX);
    setInitialSize(resizable.offsetWidth);
  }, []);

  const resize = useCallback(
    (e) => {
      const columnHeader = id
          ? document.getElementById(id).querySelector(headerSelector)
          : document.querySelector(headerSelector),
        gridElement = columnHeader.closest('.MuiDataGrid-main'),
        columnHeaderStyle = columnHeader.style,
        cells = gridElement.querySelectorAll(
          "[role='cell'][aria-colindex='" + columnHeader.ariaColIndex + "']",
        );

      const newWidth = parseInt(initialSize) + parseInt(e.clientX - initialPos);
      if (newWidth > 0) {
        for (let cell of cells) {
          const style = cell.style;
          style.width = style.minWidth = style.maxWidth = `${newWidth}px`;
        }
        columnHeaderStyle.width =
          columnHeaderStyle.minWidth =
          columnHeaderStyle.maxWidth =
            `${newWidth}px`;

        setResizeInfo({
          width: newWidth,
          index: columnHeader.ariaColIndex - 1,
        });
      }
    },
    [initialSize, initialPos, id],
  );

  useEffect(() => {
    let timeout;
    if (resizeInfo) {
      timeout = setTimeout(() => {
        onWidthChanged && onWidthChanged(resizeInfo.width, resizeInfo.index);
      }, 100);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [resizeInfo, onWidthChanged]);

  return (
    <div className="resizable" draggable onDragStart={initial} onDrag={resize}>
      <GridSeparatorIcon />
    </div>
  );
}
