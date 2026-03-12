import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ApprovalList } from './ApprovalList';

jest.mock('../../data/hooks/useConfiguration', () => ({
  useConfiguration: () => ({ EventApprovalInfo: 'Approval info' }),
}));
jest.mock('../../data/sharepointProvider', () => ({
  patchParticipants: jest.fn(),
}));
jest.mock('./Approval', () => ({
  Approval: ({ participant }) => <div>approval-{participant.id}</div>,
}));
jest.mock('../HtmlBox', () => ({
  HtmlBox: ({ html }) => <div>{html}</div>,
}));

describe('ApprovalList', () => {
  test('renders participants list and update button', () => {
    const html = renderToStaticMarkup(
      <ApprovalList
        event={{
          Participants: [
            { id: 1, ParticipantName: 'A', Email: 'a@example.org' },
            { id: 2, ParticipantName: 'B', Email: 'b@example.org' },
          ],
        }}
      />,
    );

    expect(html).toContain('approval-1');
    expect(html).toContain('approval-2');
    expect(html).toContain('Approval info');
    expect(html).toContain('Update');
  });
});
