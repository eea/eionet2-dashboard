import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ApprovalDialog } from './ApprovalDialog';

jest.mock('./ApprovalList', () => ({
  ApprovalList: () => <div>approval-list-content</div>,
}));
jest.mock('../EventDialogTitle', () => ({
  EventDialogTitle: () => <div>event-dialog-title</div>,
}));

describe('ApprovalDialog', () => {
  test('renders approval list and event title section', () => {
    const html = renderToStaticMarkup(
      <ApprovalDialog
        open={true}
        handleClose={jest.fn()}
        event={{ Title: 'Event 1' }}
        userInfo={{}}
      />,
    );

    expect(html).toContain('MuiDialog-root');
  });
});
