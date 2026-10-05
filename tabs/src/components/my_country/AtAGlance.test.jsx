let mockRunEffect = true;

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    React: actual,
    useEffect: jest.fn((fn) => {
      if (mockRunEffect) {
        mockRunEffect = false;
        fn();
      }
    }),
  };
});

import React from 'react';
jest.mock('./my_country.scss', () => ({}));
import { renderToStaticMarkup } from 'react-dom/server';
import { AtAGlance } from './AtAGlance';
import { getGroups, getMeetings, getConsultations } from '../../data/sharepointProvider';

jest.mock('../../data/sharepointProvider', () => ({
  getGroups: jest.fn((users, removeWorkingGroups) => {
    const groups = users.map((u) => u.GroupName).filter(Boolean);
    return removeWorkingGroups
      ? groups.filter((gr) => !gr.toLowerCase().startsWith('wg-'))
      : groups;
  }),
  getMeetings: jest.fn(),
  getConsultations: jest.fn(),
}));
jest.mock('./IndicatorCard', () => ({
  IndicatorCard: ({ labelText, valueText, dialogContent }) => (
    <div>
      {labelText}:{valueText}
      {dialogContent}
    </div>
  ),
}));
jest.mock('./CardColumns', () => ({
  CardColumns: ({ columns }) => (
    <div>
      {columns.map((column) => (
        <div key={column.title}>
          {column.title}=[{column.items.map((item) => item.Name).join(',')}]
        </div>
      ))}
    </div>
  ),
}));
jest.mock('./CountryProgress', () => ({
  CountryProgress: () => <div>country-progress</div>,
}));
jest.mock('../HtmlBox', () => ({
  HtmlBox: ({ html }) => <div>{html}</div>,
}));

describe('AtAGlance', () => {
  const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
  const waitForMockCall = async (mockFn, retries = 20) => {
    for (let i = 0; i < retries; i += 1) {
      if (mockFn.mock.calls.length > 0) {
        return;
      }
      await flush();
    }
  };

  const baseConfiguration = {
    UserListUrl: 'https://users',
    OrganisationListUrl: 'https://orgs',
    ConsultationListUrl: 'https://consultations?',
    InquiryListUrl: 'https://inquiries?',
    MeetingListUrl: 'https://meetings',
    CountryProgressHtml: 'Country intro',
    DashboardNoOfDisplayedYears: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRunEffect = true;
    getMeetings.mockResolvedValue([
      { Year: new Date().getFullYear(), IsPast: true, Countries: ['RO'], Group: ['group-a'] },
      { Year: new Date().getFullYear(), IsPast: true, Countries: ['RO'], Group: ['wg-secret'] },
      { Year: new Date().getFullYear(), IsPast: true, Countries: ['RO'], Group: ['N/A'] },
    ]);
    getConsultations.mockResolvedValue([
      {
        Year: new Date().getFullYear(),
        Deadline: new Date(new Date().getTime() - 86400000),
        ConsultationType: 'Consultation',
        Respondants: ['RO'],
        EionetGroups: ['group-a'],
      },
      {
        Year: new Date().getFullYear(),
        Deadline: new Date(new Date().getTime() - 86400000),
        ConsultationType: 'Enquiry',
        Respondants: ['RO'],
        EionetGroups: ['wg-secret'],
      },
    ]);
  });

  test('renders representation cards and country section', async () => {
    const html = renderToStaticMarkup(
      <AtAGlance
        users={[
          { SignedIn: true, GroupName: 'A' },
          { SignedIn: false, GroupName: 'B' },
          { SignedIn: true, GroupName: 'wg-one' },
        ]}
        organisations={[{ id: 1 }]}
        country="RO"
        userInfo={{ mail: 'nfp@example.org' }}
        configuration={baseConfiguration}
        availableGroups={['A', 'B', 'C']}
        availableWorkingGroups={['wg-one', 'wg-two']}
      />,
    );

    await waitForMockCall(getConsultations);

    expect(html).toContain('Representation:');
    expect(html).toContain('members:3');
    expect(html).toContain('members pending sign in:1');
    expect(html).toContain('organisations:1');
    expect(html).toContain('Eionet groups and thematic groups with nominations:2/3');
    expect(html).toContain('Working groups with nominations:1/2');
    expect(html).toContain('With nominations=[A,B]');
    expect(html).toContain('Without nominations=[C]');
    expect(html).toContain('With nominations=[wg-one]');
    expect(html).toContain('Without nominations=[wg-two]');
    expect(html).toContain('Country intro');
    expect(html).toContain('country-progress');

    expect(getGroups).toHaveBeenCalled();
    expect(getMeetings).toHaveBeenCalled();
    expect(getConsultations).toHaveBeenCalledWith(expect.any(Date));
  });

  test('renders cards without country-specific section when country is missing', async () => {
    const html = renderToStaticMarkup(
      <AtAGlance
        users={[{ SignedIn: false, GroupName: 'X' }]}
        organisations={[]}
        country=""
        userInfo={{}}
        configuration={baseConfiguration}
        availableGroups={['X']}
        availableWorkingGroups={[]}
      />,
    );

    await flush();
    await flush();

    expect(html).toContain('members:1');
    expect(html).toContain('Eionet groups and thematic groups with nominations:1/1');
    expect(html).not.toContain('country-progress');
    expect(html).not.toContain('Country intro');
  });

  test('supports default number of years when configuration is missing value', async () => {
    renderToStaticMarkup(
      <AtAGlance
        users={[]}
        organisations={[]}
        country="RO"
        userInfo={{}}
        configuration={{ ...baseConfiguration, DashboardNoOfDisplayedYears: undefined }}
        availableGroups={[]}
        availableWorkingGroups={[]}
      />,
    );

    await waitForMockCall(getConsultations);

    expect(getMeetings).toHaveBeenCalled();
    expect(getConsultations).toHaveBeenCalled();
  });
});
