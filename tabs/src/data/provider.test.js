jest.mock('./apiProvider', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  getConfiguration: jest.fn(),
  logInfo: jest.fn(),
  logError: jest.fn(),
}));

jest.mock('./sharepointProvider', () => ({
  getSPUserByMail: jest.fn(),
  getMeetingManager: jest.fn(),
  getOrganisationList: jest.fn(),
}));

const { apiGet, apiPost, getConfiguration, logInfo, logError } = require('./apiProvider');
const { getSPUserByMail, getMeetingManager, getOrganisationList } = require('./sharepointProvider');
const { getUserByMail, sendEmail, getMeetingJoinInfo, getUser } = require('./provider');

describe('provider', () => {
  const loadProvider = () => {
    let loaded;
    jest.isolateModules(() => {
      loaded = require('./provider');
    });
    return loaded;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getUserByMail returns AD and SharePoint data and escapes apostrophe in email', async () => {
    apiGet.mockResolvedValue({
      graphClientMessage: {
        value: [{ id: 'ad-user' }],
      },
    });
    getSPUserByMail.mockResolvedValue({ id: 'sp-user' });

    const result = await getUserByMail("o'hara@example.org");

    expect(apiGet).toHaveBeenCalledWith("/users/?$filter=mail eq 'o''hara%40example.org'");
    expect(getSPUserByMail).toHaveBeenCalledWith("o'hara@example.org");
    expect(result).toEqual({
      ADUser: { id: 'ad-user' },
      SharepointUser: { id: 'sp-user' },
      IsValid: true,
    });
  });

  test('getUserByMail returns invalid when AD user list is empty', async () => {
    apiGet.mockResolvedValue({
      graphClientMessage: {
        value: [],
      },
    });
    getSPUserByMail.mockResolvedValue(undefined);

    const result = await getUserByMail('missing@example.org');

    expect(result).toEqual({
      ADUser: undefined,
      SharepointUser: undefined,
      IsValid: false,
    });
  });

  test('getMeetingJoinInfo returns first meeting match when join id exists', async () => {
    getMeetingManager.mockResolvedValue('manager-id');
    apiGet.mockResolvedValue({
      graphClientMessage: {
        value: [{ id: 'online-meeting-id' }],
      },
    });

    const result = await getMeetingJoinInfo({
      fields: {
        JoinMeetingId: ' 123 45 ',
        MeetingmanagerLookupId: 99,
      },
    });

    expect(getMeetingManager).toHaveBeenCalledWith(99);
    expect(apiGet).toHaveBeenCalledWith(
      "/users/manager-id/onlineMeetings?$filter=joinMeetingIdSettings/JoinMeetingId eq '12345'",
    );
    expect(result).toEqual({ id: 'online-meeting-id' });
  });

  test('getMeetingJoinInfo returns undefined when join id is missing', async () => {
    const result = await getMeetingJoinInfo({
      fields: {
        JoinMeetingId: '',
        MeetingmanagerLookupId: 99,
      },
    });

    expect(result).toBeUndefined();
    expect(getMeetingManager).not.toHaveBeenCalled();
    expect(apiGet).not.toHaveBeenCalled();
  });

  test('getMeetingJoinInfo returns undefined when manager is missing', async () => {
    getMeetingManager.mockResolvedValue(undefined);

    const result = await getMeetingJoinInfo({
      fields: {
        JoinMeetingId: ' 123 45 ',
        MeetingmanagerLookupId: 99,
      },
    });

    expect(result).toBeUndefined();
    expect(apiGet).not.toHaveBeenCalled();
  });

  test('getUser returns graph client message', async () => {
    apiGet.mockResolvedValue({
      graphClientMessage: { id: 'user-id', displayName: 'User' },
    });

    const result = await getUser('user-id');

    expect(apiGet).toHaveBeenCalledWith('/users/user-id');
    expect(result).toEqual({ id: 'user-id', displayName: 'User' });
  });

  test('getUser returns undefined on api failure', async () => {
    apiGet.mockRejectedValue(new Error('boom'));

    const result = await getUser('user-id');

    expect(result).toBeUndefined();
  });

  test('sendEmail logs error when required fields are missing', async () => {
    getConfiguration.mockResolvedValue({
      FromEmailAddress: 'from@example.org',
      DashboardEmailLoggingEnabled: 'false',
    });

    await sendEmail('', '<p>Body</p>', ['to@example.org']);

    expect(logError).toHaveBeenCalledWith('Missing subject, body or recipients!', '', {
      subject: '',
      body: '<p>Body</p>',
      recipients: ['to@example.org'],
    });
    expect(apiPost).not.toHaveBeenCalled();
  });

  test('sendEmail sends mail and writes info log when email logging is enabled', async () => {
    getConfiguration.mockResolvedValue({
      FromEmailAddress: 'from@example.org',
      DashboardEmailLoggingEnabled: 'true',
    });
    apiPost.mockResolvedValue(undefined);
    logInfo.mockResolvedValue(undefined);

    await sendEmail('Subject', '<p>Body</p>', ['to@example.org']);

    expect(apiPost).toHaveBeenCalledWith('users/from@example.org/sendMail', {
      message: {
        subject: 'Subject',
        body: {
          contentType: 'HTML',
          content: '<p>Body</p>',
        },
        toRecipients: [
          {
            emailAddress: {
              address: 'to@example.org',
            },
          },
        ],
      },
      saveToSentItems: true,
    });
    expect(logInfo).toHaveBeenCalledWith(
      'Mail sent during registration process',
      'users/from@example.org/sendMail',
      expect.objectContaining({
        subject: 'Subject',
      }),
      '',
      'to@example.org',
    );
  });

  test('sendEmail sends mail without info log when email logging is disabled', async () => {
    getConfiguration.mockResolvedValue({
      FromEmailAddress: 'from@example.org',
      DashboardEmailLoggingEnabled: 'false',
    });
    apiPost.mockResolvedValue(undefined);

    await sendEmail('Subject', '<p>Body</p>', ['first@example.org', 'second@example.org']);

    expect(apiPost).toHaveBeenCalledWith('users/from@example.org/sendMail', {
      message: expect.objectContaining({
        toRecipients: [
          { emailAddress: { address: 'first@example.org' } },
          { emailAddress: { address: 'second@example.org' } },
        ],
      }),
      saveToSentItems: true,
    });
    expect(logInfo).not.toHaveBeenCalled();
  });

  test('sendEmail attaches ICS payload when attachment is provided', async () => {
    getConfiguration.mockResolvedValue({
      FromEmailAddress: 'from@example.org',
      DashboardEmailLoggingEnabled: 'false',
    });
    apiPost.mockResolvedValue(undefined);

    global.FileReader = class {
      readAsDataURL() {
        this.result = 'data:text/calendar;base64,ZmFrZS1pY3M=';
        this.onloadend();
      }
    };

    await sendEmail('Subject', '<p>Body</p>', ['to@example.org'], { name: 'event.ics' });

    expect(apiPost).toHaveBeenCalledWith('users/from@example.org/sendMail', {
      message: expect.objectContaining({
        attachments: [
          {
            '@odata.type': '#microsoft.graph.fileAttachment',
            name: 'event.ics',
            contentType: 'text/calendar; charset=utf-8; method=REQUEST; name=event.ics',
            contentBytes: 'ZmFrZS1pY3M=',
          },
        ],
      }),
      saveToSentItems: true,
    });
  });

  test('getMe builds and caches profile for valid sharepoint user', async () => {
    const { getMe } = loadProvider();
    getConfiguration.mockResolvedValue({
      AdminGroupId: 'admin-group',
      NFPGroupId: 'nfp-group',
      SelfSeviceHelpdeskPreferencesText: 'Pref text',
      SelfSeviceHelpdeskPersonalDetailsText: 'Details text',
    });
    apiGet
      .mockResolvedValueOnce({
        graphClientMessage: {
          displayName: 'John Doe',
          mail: 'john@example.org',
          country: 'RO',
        },
      })
      .mockResolvedValueOnce({
        graphClientMessage: {
          value: [{ id: 'admin-group' }],
        },
      })
      .mockResolvedValueOnce({
        graphClientMessage: {
          value: [{ givenName: 'John', surname: 'Doe' }],
        },
      });
    getSPUserByMail.mockResolvedValue({
      fields: {
        Title: 'Mr',
        Phone: '123',
        Email: 'john@example.org',
        Country: 'RO',
        Membership: ['B', 'A'],
        OtherMemberships: ['Y', 'X'],
        Gender: 'M',
        OrganisationLookupId: 11,
        NFP: 'NFP',
        SuggestedOrganisation: 'Org S',
        Department: 'Dept',
        JobTitle: 'Job',
        PCP: 'PCP',
        id: 1,
        ADUserId: 77,
      },
    });
    getOrganisationList.mockResolvedValue([{ content: 11, header: 'Org Header' }]);

    const profile = await getMe();
    const cached = await getMe();

    expect(profile).toEqual(
      expect.objectContaining({
        displayName: 'John Doe',
        mail: 'john@example.org',
        country: 'RO',
        isAdmin: true,
        isNFP: false,
        isGuest: false,
        isEionetUser: true,
        Organisation: 'Org Header',
        Memberships: ['A', 'B'],
        OtherMemberships: ['X', 'Y'],
      }),
    );
    expect(cached).toBe(profile);
    expect(getOrganisationList).toHaveBeenCalledWith('RO');
    expect(apiGet).toHaveBeenCalledTimes(3);
  });

  test('getMe returns non-eionet profile when sharepoint user is missing', async () => {
    const { getMe } = loadProvider();
    getConfiguration.mockResolvedValue({
      AdminGroupId: 'admin-group',
      NFPGroupId: 'nfp-group',
    });
    apiGet
      .mockResolvedValueOnce({
        graphClientMessage: {
          displayName: 'Guest User',
          mail: 'guest@example.org',
          country: 'DE',
        },
      })
      .mockResolvedValueOnce({
        graphClientMessage: {
          value: [{ id: 'nfp-group' }],
        },
      })
      .mockResolvedValueOnce({
        graphClientMessage: {
          value: [{ givenName: 'Guest', surname: 'User' }],
        },
      });
    getSPUserByMail.mockResolvedValue(undefined);

    const profile = await getMe();

    expect(profile).toEqual(
      expect.objectContaining({
        displayName: 'Guest User',
        mail: 'guest@example.org',
        country: 'DE',
        isEionetUser: false,
        isAdmin: false,
        isNFP: true,
        isGuest: false,
      }),
    );
  });
});
