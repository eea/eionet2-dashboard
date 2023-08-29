import { React } from 'react';
import { Box } from '@mui/material';
import DOMPurify from 'dompurify';

export function HtmlBox({ html }) {
  return (
    <div>
      {html && (
        <Box
          sx={{ width: '90%' }}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(html),
          }}
        />
      )}
    </div>
  );
}
