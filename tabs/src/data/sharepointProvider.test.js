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
const { sendEmail } = require('./provider');
const { createIcs } = require('./icsHelper');

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
  MeetingRatingListId: 'meeting-rating-list-id',
  FromEmailAddress: 'from@example.org',
  RegOnlineEmailSubjectUser: 'User online {MeetingTitle}',
  RegOnlineEmailBodyUser: 'Join {MeetingTitle} at {MeetingJoinUrl}',
  RegOfflineEmailSubjectUser: 'User offline {MeetingTitle}',
  RegOfflineEmailBodyUser: 'Offline body {MeetingTitle}',
  RegOnlineEmailSubjectNFP: 'NFP online {MeetingTitle}',
  RegOnlineEmailBodyNFP: 'NFP body {MeetingTitle}',
  RegOfflineEmailSubjectNFP: 'NFP offline {MeetingTitle}',
  RegOfflineEmailBodyNFP: 'NFP offline body {MeetingTitle}',
  InviteOnlineEmailSubject: 'Invite online {MeetingTitle}',
  InviteOnlineEmailBody: 'Invite body {MeetingTitle} {MeetingJoinUrl}',
  InviteOfflineEmailSubject: 'Invite offline {MeetingTitle}',
  InviteOfflineEmailBody: 'Invite offline body {MeetingTitle}',
  RegOnlineNFPAccepts: 'Accepted {MeetingTitle} {MeetingJoinUrl}',
  RegOnlineNFPDeclines: 'Declined {MeetingTitle}',
  RegOfflineNFPAccepts: 'Offline accepted {MeetingTitle}',
  RegOfflineNFPDeclines: 'Offline declined {MeetingTitle}',
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

  test('getCurrentParticipant builds default participant when user is missing', async () => {
    const { apiProvider, sharepointProvider } = loadModule();
    apiProvider.getConfiguration.mockResolvedValue(baseConfig);
    apiProvider.apiGet.mockResolvedValue({
      graphClientMessage: { value: [] },
    });

    const event = { id: 100 };
    const userInfo = { country: 'RO', mail: 'u2@example.org', givenName: 'U', surname: 'Two' };
    const result = await sharepointProvider.getCurrentParticipant(event, userInfo);

    expect(result).toEqual(
      expect.objectContaining({
        MeetingId: 100,
        ParticipantName: 'U Two',
        Email: 'u2@example.org',
        Registered: false,
      }),
    );
  });

  test('getGroups deduplicates and removes working groups', () => {
    const { sharepointProvider } = loadModule();
    const workingGroup = `${Constants.WorkingGroupPrefix}Air`;
    const groups = sharepointProvider.getGroups(
      [{ Membership: [workingGroup, 'Core Group'] }, { Membership: ['Core Group', 'Another'] }],
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

  test('getInvitedUsers maps memberships and organisation info', async () => {
    const { apiProvider, sharepointProvider } = loadModule();
    apiProvider.getConfiguration.mockResolvedValue(baseConfig);
    apiProvider.apiGet
      .mockResolvedValueOnce({
        graphClientMessage: {
          value: [{ id: 100, fields: { Title: 'Org 1' } }],
        },
      })
      .mockResolvedValueOnce({
        graphClientMessage: {
          value: [
            {
              fields: {
                id: 1,
                Title: 'User 1',
                Email: 'u1@example.org',
                Membership: ['M1'],
                OtherMemberships: ['M2'],
                NFP: 'NFP',
                Country: 'RO',
                OrganisationLookupId: 100,
                SignedIn: true,
              },
            },
          ],
        },
      });

    const result = await sharepointProvider.getInvitedUsers('RO');

    expect(apiProvider.apiGet.mock.calls[1][0]).toContain("fields/Country eq 'RO'");
    expect(result).toEqual([
      expect.objectContaining({
        Title: 'User 1',
        Organisation: 'Org 1',
        AllMemberships: ['M1', 'M2', 'NFP'],
      }),
    ]);
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

  test('getADUserInfos returns user info with photo and tolerates photo error', async () => {
    const { apiProvider, sharepointProvider } = loadModule();
    apiProvider.getConfiguration.mockResolvedValue(baseConfig);
    apiProvider.apiGet.mockImplementation(async (path) => {
      if (path.includes('/User Information List/items/11')) {
        return { graphClientMessage: { fields: { EMail: 'first@example.org' } } };
      }
      if (path.includes('/User Information List/items/22')) {
        return { graphClientMessage: { fields: { EMail: 'second@example.org' } } };
      }
      if (path.includes("mail eq 'first%40example.org'")) {
        return { graphClientMessage: { value: [{ id: 'first-ad-id', displayName: 'First' }] } };
      }
      if (path.includes("mail eq 'second%40example.org'")) {
        return { graphClientMessage: { value: [{ id: 'second-ad-id', displayName: 'Second' }] } };
      }
      if (path.includes('/users/first-ad-id/photos/48x48/$value')) {
        return { graphClientMessage: 'base64-first' };
      }
      if (path.includes('/users/second-ad-id/photos/48x48/$value')) {
        throw new Error('photo missing');
      }
      return { graphClientMessage: {} };
    });

    const result = await sharepointProvider.getADUserInfos([11, 22]);

    expect(result).toEqual([
      expect.objectContaining({
        id: 'first-ad-id',
        lookupId: 11,
        base64Photo: 'base64-first',
      }),
      expect.objectContaining({
        id: 'second-ad-id',
        lookupId: 22,
      }),
    ]);
  });

  test('postParticipant sends external invitation email and returns graph message', async () => {
    const { apiProvider, sharepointProvider } = loadModule();
    apiProvider.getConfiguration.mockResolvedValue(baseConfig);
    apiProvider.apiPost.mockResolvedValue({ graphClientMessage: { id: 'participant-id' } });
    sendEmail.mockResolvedValue(undefined);
    createIcs.mockReturnValue('ics-content');

    const participant = {
      MeetingId: 9,
      ParticipantName: 'Ext User',
      Email: 'ext@example.org',
      Country: 'RO',
      Registered: true,
      Participated: false,
      RegistrationDate: '2025-01-01',
      PhysicalParticipation: false,
      EEAReimbursementRequested: false,
      CustomMeetingRequest: '',
      IsInvitedByNFP: true,
    };
    const event = {
      Title: 'Event A',
      MeetingLink: 'https://join',
      IsOnline: true,
      IsOnlineOrHybrid: true,
    };

    const result = await sharepointProvider.postParticipant(participant, event);

    expect(apiProvider.apiPost).toHaveBeenCalledWith(
      '/sites/site-id/lists/participants-list-id/items',
      expect.objectContaining({
        fields: expect.objectContaining({
          Participantname: 'Ext User',
          IsInvitedByNFP: true,
        }),
      }),
    );
    expect(createIcs).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledWith(
      'Invite online Event A',
      'Invite body Event A https://join',
      ['ext@example.org'],
      'ics-content',
    );
    expect(result).toEqual({ id: 'participant-id' });
  });

  test('patchParticipant sends approval email with attachment for approved online event', async () => {
    const { apiProvider, sharepointProvider } = loadModule();
    apiProvider.getConfiguration.mockResolvedValue(baseConfig);
    apiProvider.apiPatch.mockResolvedValue({});
    sendEmail.mockResolvedValue(undefined);
    createIcs.mockReturnValue('ics-approval');

    const participant = {
      id: 7,
      Email: 'user@example.org',
      Registered: true,
      Participated: false,
      PhysicalParticipation: false,
      EEAReimbursementRequested: false,
      CustomMeetingRequest: '',
      NFPApproved: 'Approved',
    };
    const event = {
      Title: 'Event B',
      MeetingLink: 'https://join',
      MeetingType: 'Online',
      IsOnlineOrHybrid: true,
    };

    const ok = await sharepointProvider.patchParticipant(participant, event, true);

    expect(ok).toBe(true);
    expect(sendEmail).toHaveBeenCalledWith(
      'User online Event B',
      'Accepted Event B https://join',
      ['user@example.org'],
      'ics-approval',
    );
  });

  test('deleteParticipant returns false when delete fails', async () => {
    const { apiProvider, sharepointProvider } = loadModule();
    apiProvider.getConfiguration.mockResolvedValue(baseConfig);
    apiProvider.apiDelete.mockRejectedValue(new Error('delete failed'));

    const result = await sharepointProvider.deleteParticipant({ id: 1 });

    expect(result).toBe(false);
  });

  test('postRating posts new rating and updates participant as voted', async () => {
    const { apiProvider, sharepointProvider } = loadModule();
    apiProvider.getConfiguration.mockResolvedValue(baseConfig);
    apiProvider.apiGet.mockResolvedValue({
      graphClientMessage: { value: [] },
    });
    apiProvider.apiPost.mockResolvedValue({});
    apiProvider.apiPatch.mockResolvedValue({});
    apiProvider.logInfo.mockResolvedValue(undefined);

    const result = await sharepointProvider.postRating({ id: 99, Title: 'Event C' }, { id: 8 }, 4);

    expect(result).toBe(true);
    expect(apiProvider.apiPost).toHaveBeenCalledWith(
      '/sites/site-id/lists/meeting-rating-list-id/items',
      expect.objectContaining({
        fields: expect.objectContaining({
          EventLookupId: 99,
          Responses: 1,
          Rating: 4,
        }),
      }),
    );
    expect(apiProvider.apiPatch).toHaveBeenCalledWith(
      '/sites/site-id/lists/participants-list-id/items/8',
      { fields: { Voted: true } },
    );
    expect(apiProvider.logInfo).toHaveBeenCalled();
  });

  test('postRating retries when patch gets 412 and then succeeds', async () => {
    const { apiProvider, sharepointProvider } = loadModule();
    apiProvider.getConfiguration.mockResolvedValue(baseConfig);
    apiProvider.apiGet
      .mockResolvedValueOnce({
        graphClientMessage: {
          value: [{ id: 5, eTag: 'v1', fields: { Responses: 1, Rating: 2 } }],
        },
      })
      .mockResolvedValueOnce({
        graphClientMessage: {
          value: [{ id: 5, eTag: 'v2', fields: { Responses: 2, Rating: 3 } }],
        },
      });
    apiProvider.apiPatch
      .mockRejectedValueOnce({ response: { status: 412 } })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});
    apiProvider.logInfo.mockResolvedValue(undefined);

    const result = await sharepointProvider.postRating({ id: 77, Title: 'Event D' }, { id: 9 }, 5);

    expect(result).toBe(true);
    expect(apiProvider.apiPatch).toHaveBeenNthCalledWith(
      1,
      '/sites/site-id/lists/meeting-rating-list-id/items/5',
      { fields: { Responses: 2, Rating: 7 } },
      'v1',
    );
    expect(apiProvider.apiPatch).toHaveBeenNthCalledWith(
      2,
      '/sites/site-id/lists/meeting-rating-list-id/items/5',
      { fields: { Responses: 3, Rating: 8 } },
      'v2',
    );
  });

  test('postRating returns false when participant vote update fails', async () => {
    const { apiProvider, sharepointProvider } = loadModule();
    apiProvider.getConfiguration.mockResolvedValue(baseConfig);
    apiProvider.apiGet.mockResolvedValue({
      graphClientMessage: { value: [] },
    });
    apiProvider.apiPost.mockResolvedValue({});
    apiProvider.apiPatch.mockRejectedValueOnce(new Error('patch participant failed'));

    const result = await sharepointProvider.postRating(
      { id: 101, Title: 'Event E' },
      { id: 10 },
      2,
    );

    expect(result).toBe(false);
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
