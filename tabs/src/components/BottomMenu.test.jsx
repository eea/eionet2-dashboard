import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useMediaQuery } from 'react-responsive';

const mockButton = jest.fn(({ children }) => <div>{children}</div>);
const mockMenuItem = jest.fn(({ children }) => <div>{children}</div>);

jest.mock('react-responsive', () => ({
  useMediaQuery: jest.fn(),
}));
jest.mock('./Tab.scss', () => ({}));
jest.mock('@mui/icons-material/OpenInNew', () => () => <span>open-icon</span>);
jest.mock('@mui/material', () => ({
  Menu: ({ children }) => <div>{children}</div>,
  MenuItem: (props) => mockMenuItem(props),
  Typography: ({ children }) => <div>{children}</div>,
  Box: ({ children }) => <div>{children}</div>,
  BottomNavigation: ({ children }) => <div>{children}</div>,
  Button: (props) => mockButton(props),
}));

import { BottomMenu } from './BottomMenu';

describe('BottomMenu', () => {
  const configuration = {
    ConsultationListUrl: 'https://example.org/consultations',
    MeetingListUrl: 'https://example.org/events',
    InquiryListUrl: 'https://example.org/enquiries',
    OrganisationListUrl: 'https://example.org/organisations',
    UserListUrl: 'https://example.org/users',
  };

  const getNodeText = (node) => {
    if (node === null || node === undefined || typeof node === 'boolean') {
      return '';
    }
    if (typeof node === 'string' || typeof node === 'number') {
      return String(node);
    }
    if (Array.isArray(node)) {
      return node.map(getNodeText).join('');
    }
    if (node.props && node.props.children !== undefined) {
      return getNodeText(node.props.children);
    }
    return '';
  };

  const findByLabel = (mockFn, label) =>
    mockFn.mock.calls
      .map(([props]) => props)
      .find((props) => getNodeText(props.children).includes(label));

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.REACT_APP_VERSION = '9.9.9';
    global.window = { open: jest.fn() };
  });

  test('renders desktop details section and opens expected links', () => {
    useMediaQuery.mockReturnValue(false);

    const html = renderToStaticMarkup(<BottomMenu configuration={configuration} />);

    findByLabel(mockButton, 'All consultations').onClick();
    findByLabel(mockButton, 'All enquiries').onClick();
    findByLabel(mockButton, 'All events').onClick();

    expect(html).toContain('View details:');
    expect(html).toContain('v9.9.9');
    expect(window.open).toHaveBeenCalledWith(
      'https://example.org/consultations&useFiltersInViewXml=1&FilterFields2=IsECConsultation&FilterValues2=Eionet-and-EC%3B%23Eionet-only%3B%23N%2FA&FilterTypes2=Choice&FilterOp2=In',
      '_blank',
    );
    expect(window.open).toHaveBeenCalledWith(
      'https://example.org/enquiries&useFiltersInViewXml=1&FilterFields2=IsECConsultation&FilterValues2=Eionet-and-EC%3B%23Eionet-only%3B%23N%2FA&FilterTypes2=Choice&FilterOp2=In',
      '_blank',
    );
    expect(window.open).toHaveBeenCalledWith('https://example.org/events', '_blank');
  });

  test('renders mobile view and opens selected menu links', () => {
    useMediaQuery.mockReturnValue(true);

    const html = renderToStaticMarkup(<BottomMenu configuration={configuration} />);

    findByLabel(mockButton, 'View details').onClick({ currentTarget: { id: 'anchor' } });
    findByLabel(mockMenuItem, 'All users').onClick();

    expect(html).toContain('View details');
    expect(html).not.toContain('View details:');
    expect(window.open).toHaveBeenCalledWith('https://example.org/users', '_blank');
  });
});
