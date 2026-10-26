import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { InfoDialog } from './InfoDialog';

jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    Dialog: ({ open, children }) => (open ? <div>{children}</div> : null),
  };
});

describe('InfoDialog', () => {
  test('renders title, info text and content when open', () => {
    const html = renderToStaticMarkup(
      <InfoDialog
        open={true}
        onClose={jest.fn()}
        infoText="Info text"
        dialogTitle="Title"
        dialogContent={<span>Content</span>}
      />,
    );

    expect(html).toContain('Title');
    expect(html).toContain('Info text');
    expect(html).toContain('Content');
    expect(html).toContain('Close');
  });

  test('renders nothing when closed', () => {
    const html = renderToStaticMarkup(
      <InfoDialog open={false} onClose={jest.fn()} infoText="Info text" />,
    );

    expect(html).not.toContain('Info text');
  });

  test('passes onClose and fullWidth to the dialog', () => {
    const onClose = jest.fn(),
      element = InfoDialog({ open: true, onClose, dialogContent: <span>Content</span> });

    expect(element.props.onClose).toBe(onClose);
    expect(element.props.fullWidth).toBe(true);
  });
});
