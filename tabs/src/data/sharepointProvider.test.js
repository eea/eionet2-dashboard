jest.mock('./apiProvider', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPatch: jest.fn(),
  getConfiguration: jest.fn(),
  apiDelete: jest.fn(),
  logError: jest.fn(),
  logInfo: jest.fn(),
}));

jest.mock('./provider', () => ({
  sendEmail: jest.fn(),
}));

jest.mock('./icsHelper', () => ({
  createIcs: jest.fn(),
}));

const Constants = require('./constants.json');

function loadModule() {
  let apiProvider;
  let sharepointProvider;
  jest.isolateModules(() => {
    apiProvider = require('./apiProvider');
    sharepointProvider = require('./sharepointProvider');
  });
  return { apiProvider, sharepointProvider };
}

const baseConfig = {
  SharepointSiteId: 'site-id',
  OrganisationListId: 'org-list-id',
  MappingListId: 'mapping-list-id',
  UserListId: 'user-list-id',
  ConsultationListId: 'consult-list-id',
  ConsultationListItemUrl: 'https://example.org/consult-items',
  MeetingParticipantsListId: 'participants-list-id',
  CommunicationSiteId: 'comm-site-id',
  PublicationListId: 'pub-list-id',
  ObligationsListId: 'obl-list-id',
  EventListItemUrl: 'https://example.org/event-items',
  MeetingListId: 'meeting-list-id',
  MeetingParticipantsListUrl: 'https://example.org/participants',
  NoOfDaysForRating: 5,
  CountryCodeMappingListId: 'country-map-list-id',
};

describe('sharepointProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getOrganisationList maps values', async () => {
    const { apiProvider, sharepointProvider } = loadModule();
    apiProvider.getConfiguration.mockResolvedValue(baseConfig);
    apiProvider.apiGet.mockResolvedValue({
      graphClientMessage: {
        value: [{ id: 10, fields: { Title: 'Org 1' } }],
      },
    });

    const result = await sharepointProvider.getOrganisationList('RO');

    expect(apiProvider.apiGet.mock.calls[0][0]).toContain("fields/Country eq 'RO'");
    expect(result).toEqual([{ header: 'Org 1', content: 10 }]);
  });

  test('getMappingsList caches data after first call', async () => {
    const { apiProvider, sharepointProvider } = loadModule();
    apiProvider.getConfiguration.mockResolvedValue(baseConfig);
    apiProvider.apiGet.mockResolvedValue({
      graphClientMessage: {
        value: [
          {
            fields: {
              TeamURL: 'https://teams',
              O365group: 'G',
              O365GroupId: 'gid',
              Membership: 'M',
              Tag: 'T',
              OtherMembership: false,
              ManagementBoard: true,
              EEAGroupLeads: [],
              ETCManagers: [],
              OfficialGroupName: 'Official',
            },
          },
        ],
      },
    });

    const first = await sharepointProvider.getMappingsList();
    const second = await sharepointProvider.getMappingsList();

    expect(first).toEqual(second);
    expect(apiProvider.apiGet).toHaveBeenCalledTimes(1);
  });

  test('getCountries and getAvailableGroups read choice columns', async () => {
    const { apiProvider, sharepointProvider } = loadModule();
    apiProvider.getConfiguration.mockResolvedValue(baseConfig);
    apiProvider.apiGet
      .mockResolvedValueOnce({
        graphClientMessage: {
          value: [{ name: 'Country', choice: { choices: ['RO', 'DE'] } }],
        },
      })
      .mockResolvedValueOnce({
        graphClientMessage: {
          value: [{ name: 'Membership', choice: { choices: ['Group A'] } }],
        },
      });

    const countries = await sharepointProvider.getCountries();
    const groups = await sharepointProvider.getAvailableGroups();

    expect(countries).toEqual(['RO', 'DE']);
    expect(groups).toEqual(['Group A']);
  });

  test('getSPUserByMail returns first profile when available', async () => {
    const { apiProvider, sharepointProvider } = loadModule();
    apiProvider.getConfiguration.mockResolvedValue(baseConfig);
    apiProvider.apiGet.mockResolvedValue({
      graphClientMessage: { value: [{ id: 1, fields: { Email: 'x@y' } }] },
    });

    const result = await sharepointProvider.getSPUserByMail("o'hara@example.org");

    expect(apiProvider.apiGet.mock.calls[0][0]).toContain("o''hara%40example.org");
    expect(result).toEqual({ id: 1, fields: { Email: 'x@y' } });
  });

  test('getConsultations maps consultation fields', async () => {
    const { apiProvider, sharepointProvider } = loadModule();
    apiProvider.getConfiguration.mockResolvedValue(baseConfig);
    apiProvider.apiGet.mockResolvedValue({
      graphClientMessage: {
        value: [
          {
            fields: {
              id: 1,
              Title: 'Consultation',
              ConsultationType: 'Consultation',
              Description: 'Desc',
              Startdate: '2024-01-01',
              Closed: '2024-02-01',
              Deadline: '2024-03-01',
              Year: '2024',
              LinktoFolder: 'https://folder',
              Respondants: ['RO'],
              Countries: ['RO'],
              ConsulationmanagerLookupId: 9,
              EionetGroups: ['G1'],
              LinkToResults: 'https://results',
            },
          },
        ],
      },
    });

    const result = await sharepointProvider.getConsultations('2024-01-01', 'RO');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({
        id: 1,
        Title: 'Consultation',
        HasUserCountryResponded: true,
      }),
    );
  });

  test('getParticipants handles pagination and maps fields', async () => {
    const { apiProvider, sharepointProvider } = loadModule();
    apiProvider.getConfiguration.mockResolvedValue(baseConfig);
    apiProvider.apiGet
      .mockResolvedValueOnce({
        graphClientMessage: {
          value: [
            {
              fields: {
                id: 1,
                MeetingtitleLookupId: 100,
                Participantname: 'User 1',
                EMail: 'u1@example.org',
                Countries: 'RO',
                Registered: true,
                Participated: false,
              },
            },
          ],
          '@odata.nextLink': 'next-link',
        },
      })
      .mockResolvedValueOnce({
        graphClientMessage: {
          value: [
            {
              fields: {
                id: 2,
                MeetingtitleLookupId: 100,
                Participantname: 'User 2',
                EMail: 'u2@example.org',
                Countries: 'RO',
                Registered: false,
                Participated: true,
              },
            },
          ],
        },
      });

    const result = await sharepointProvider.getParticipants(100, 'RO');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(
      expect.objectContaining({
        MeetingId: 100,
        ParticipantName: 'User 1',
      }),
    );
  });

  test('getCurrentParticipant returns existing participant', async () => {
    const { apiProvider, sharepointProvider } = loadModule();
    apiProvider.getConfiguration.mockResolvedValue(baseConfig);
    apiProvider.apiGet.mockResolvedValue({
      graphClientMessage: {
        value: [
          {
            fields: {
              id: 1,
              MeetingtitleLookupId: 100,
              Participantname: 'User 1',
              EMail: 'u1@example.org',
              Countries: 'RO',
              Registered: true,
              Participated: false,
            },
          },
        ],
      },
    });

    const event = { id: 100 };
    const userInfo = { country: 'RO', mail: 'u1@example.org', givenName: 'U', surname: 'One' };
    const result = await sharepointProvider.getCurrentParticipant(event, userInfo);

    expect(result.Email).toBe('u1@example.org');
    expect(result.Registered).toBe(true);
  });

  test('getGroups deduplicates and removes working groups', () => {
    const { sharepointProvider } = loadModule();
    const workingGroup = `${Constants.WorkingGroupPrefix}Air`;
    const groups = sharepointProvider.getGroups(
      [
        { Membership: [workingGroup, 'Core Group'] },
        { Membership: ['Core Group', 'Another'] },
      ],
      true,
    );

    expect(groups).toEqual(expect.arrayContaining(['Core Group', 'Another']));
    expect(groups).not.toContain(workingGroup);
  });

  test('getPublications maps only records with date', async () => {
    const { apiProvider, sharepointProvider } = loadModule();
    apiProvider.getConfiguration.mockResolvedValue(baseConfig);
    apiProvider.apiGet.mockResolvedValue({
      graphClientMessage: {
        value: [
          {
            fields: {
              id: 1,
              Title: 'Publication 1',
              Item_x0020_type: 'News',
              Status: 'Open',
              Date_x0028_outpublic_x0029_: '2024-01-01',
            },
          },
          { fields: { id: 2, Title: 'No date' } },
        ],
      },
    });

    const result = await sharepointProvider.getPublications();

    expect(result).toHaveLength(1);
    expect(result[0].Title).toBe('Publication 1');
  });

  test('getObligations maps deadline and continuous records', async () => {
    const { apiProvider, sharepointProvider } = loadModule();
    apiProvider.getConfiguration.mockResolvedValue(baseConfig);
    apiProvider.apiGet.mockResolvedValue({
      graphClientMessage: {
        value: [
          {
            fields: {
              id: 1,
              Title: 'Continuous',
              IsEEACore: true,
            },
          },
          {
            fields: {
              id: 2,
              Title: 'Upcoming',
              Deadline: '2999-01-01',
              IsEEACore: false,
            },
          },
        ],
      },
    });

    const result = await sharepointProvider.getObligations();

    expect(result).toHaveLength(2);
    expect(result.find((r) => r.id === 1).IsContinuous).toBe(true);
    expect(result.find((r) => r.id === 2).IsUpcoming).toBe(true);
  });

  test('getMeetingManager caches AD user id', async () => {
    const { apiProvider, sharepointProvider } = loadModule();
    apiProvider.getConfiguration.mockResolvedValue(baseConfig);
    apiProvider.apiGet
      .mockResolvedValueOnce({
        graphClientMessage: { fields: { EMail: 'user@example.org' } },
      })
      .mockResolvedValueOnce({
        graphClientMessage: { value: [{ id: 'ad-user-id' }] },
      });

    const first = await sharepointProvider.getMeetingManager(99);
    const second = await sharepointProvider.getMeetingManager(99);

    expect(first).toBe('ad-user-id');
    expect(second).toBe('ad-user-id');
    expect(apiProvider.apiGet).toHaveBeenCalledTimes(2);
  });

  test('getCountryCodeMappingsList caches mapping list', async () => {
    const { apiProvider, sharepointProvider } = loadModule();
    apiProvider.getConfiguration.mockResolvedValue(baseConfig);
    apiProvider.apiGet.mockResolvedValue({
      graphClientMessage: {
        value: [
          {
            fields: {
              Title: 'RO',
              CountryName: 'Romania',
              CDO: [],
              TeamMember: [],
            },
          },
        ],
      },
    });

    const first = await sharepointProvider.getCountryCodeMappingsList();
    const second = await sharepointProvider.getCountryCodeMappingsList();

    expect(first).toEqual(second);
    expect(first[0].CountryCode).toBe('RO');
    expect(apiProvider.apiGet).toHaveBeenCalledTimes(1);
  });
});
