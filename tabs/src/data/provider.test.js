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
const { getSPUserByMail, getMeetingManager } = require('./sharepointProvider');
const { getUserByMail, sendEmail, getMeetingJoinInfo } = require('./provider');

describe('provider', () => {
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
});
