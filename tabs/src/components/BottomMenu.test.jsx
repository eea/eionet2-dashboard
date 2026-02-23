import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useMediaQuery } from 'react-responsive';

jest.mock('react-responsive', () => ({
  useMediaQuery: jest.fn(),
}));
jest.mock('./Tab.scss', () => ({}));

import { BottomMenu } from './BottomMenu';

describe('BottomMenu', () => {
  const configuration = {
    ConsultationListUrl: 'https://example.org/consultations',
    MeetingListUrl: 'https://example.org/events',
    InquiryListUrl: 'https://example.org/enquiries',
    OrganisationListUrl: 'https://example.org/organisations',
    UserListUrl: 'https://example.org/users',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.REACT_APP_VERSION = '9.9.9';
  });

  test('renders desktop details section and links', () => {
    useMediaQuery.mockReturnValue(false);

    const html = renderToStaticMarkup(<BottomMenu configuration={configuration} />);

    expect(html).toContain('View details:');
    expect(html).toContain('All consultations');
    expect(html).toContain('All events');
    expect(html).toContain('All enquiries');
    expect(html).toContain('All organisations');
    expect(html).toContain('All users');
    expect(html).toContain('v9.9.9');
    expect(html).not.toContain('id="basic-button"');
  });

  test('renders mobile view details button', () => {
    useMediaQuery.mockReturnValue(true);

    const html = renderToStaticMarkup(<BottomMenu configuration={configuration} />);

    expect(html).toContain('View details');
    expect(html).toContain('id="basic-button"');
    expect(html).not.toContain('View details:');
  });
});
