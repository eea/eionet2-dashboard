import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Approval } from './Approval';

describe('Approval', () => {
  test('renders participant details and invited by NFP state', () => {
    const html = renderToStaticMarkup(
      <Approval
        participant={{
          id: 1,
          ParticipantName: 'User 1',
          Email: 'user1@example.org',
          NFPApproved: 'No value',
          PhysicalParticipation: false,
          EEAReimbursementRequested: false,
          IsInvitedByNFP: true,
        }}
      />,
    );

    expect(html).toContain('User 1');
    expect(html).toContain('user1@example.org');
    expect(html).toContain('Invited by NFP');
  });
});
