jest.mock('@microsoft/teams-js', () => ({
  app: {
    initialize: jest.fn().mockResolvedValue(undefined),
  },
  authentication: {
    getAuthToken: jest.fn().mockResolvedValue('token-123'),
  },
}));

const mockRequest = jest.fn();
jest.mock('axios', () => ({
  __esModule: true,
  request: mockRequest,
  default: {
    request: mockRequest,
  },
}));

describe('apiProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env.REACT_APP_FUNC_ENDPOINT = 'https://func.example.org';
    process.env.REACT_APP_SHAREPOINT_SITE_ID = 'site-id';
    process.env.REACT_APP_CONFIGURATION_LIST_ID = 'cfg-list-id';
  });

  test('apiGet calls function endpoint with auth token and query params', async () => {
    const axios = require('axios');
    const { apiGet } = require('./apiProvider');

    axios.default.request.mockResolvedValue({
      data: { graphClientMessage: { value: [] } },
    });

    const response = await apiGet('/users', 'user', true);

    expect(response).toEqual({ graphClientMessage: { value: [] } });
    expect(axios.default.request).toHaveBeenCalledWith({
      method: 'get',
      url: 'https://func.example.org/api/graphData',
      headers: {
        authorization: 'Bearer token-123',
      },
      data: undefined,
      params: {
        path: '/users',
        credentialType: 'user',
      },
    });
  });

  test('apiPatch includes eTag when provided', async () => {
    const axios = require('axios');
    const { apiPatch } = require('./apiProvider');

    axios.default.request.mockResolvedValue({
      data: { ok: true },
    });

    await apiPatch('/sites/abc', { key: 'value' }, 'etag-value');

    expect(axios.default.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'patch',
        data: {
          credentialType: 'app',
          data: { key: 'value' },
          path: '/sites/abc',
          eTag: 'etag-value',
        },
      }),
    );
  });

  test('getUserMail caches user email after first request', async () => {
    const axios = require('axios');
    const { getUserMail } = require('./apiProvider');

    axios.default.request.mockResolvedValue({
      data: {
        graphClientMessage: {
          mail: 'cached@example.org',
        },
      },
    });

    const first = await getUserMail();
    const second = await getUserMail();

    expect(first).toBe('cached@example.org');
    expect(second).toBe('cached@example.org');
    expect(axios.default.request).toHaveBeenCalledTimes(1);
  });

  test('getConfiguration caches mapped SharePoint config', async () => {
    const axios = require('axios');
    const { getConfiguration } = require('./apiProvider');

    axios.default.request.mockResolvedValue({
      data: {
        graphClientMessage: {
          value: [
            { fields: { Title: 'LoggingListId', Value: 'log-list-id' } },
            { fields: { Title: 'FromEmailAddress', Value: 'from@example.org' } },
          ],
        },
      },
    });

    const first = await getConfiguration();
    const second = await getConfiguration();

    expect(first).toEqual({
      LoggingListId: 'log-list-id',
      FromEmailAddress: 'from@example.org',
      SharepointSiteId: 'site-id',
    });
    expect(second).toEqual(first);
    expect(axios.default.request).toHaveBeenCalledTimes(1);
  });

  test('apiGet rethrows and skips logging when requiresLogin is true', async () => {
    const axios = require('axios');
    const { apiGet } = require('./apiProvider');
    const err = { requiresLogin: true };

    axios.default.request.mockRejectedValue(err);

    await expect(apiGet('/users')).rejects.toBe(err);
    expect(axios.default.request).toHaveBeenCalledTimes(1);
  });

  test('apiPost rethrows and skips logging when skipLog is true', async () => {
    const axios = require('axios');
    const { apiPost } = require('./apiProvider');
    const err = new Error('post failed');

    axios.default.request.mockRejectedValue(err);

    await expect(apiPost('/users', { a: 1 }, 'app', true)).rejects.toBe(err);
    expect(axios.default.request).toHaveBeenCalledTimes(1);
  });

  test('logError uses missing-index message and writes to logging list when config exists', async () => {
    const axios = require('axios');
    const { getConfiguration, logError } = require('./apiProvider');

    axios.default.request
      .mockResolvedValueOnce({
        data: {
          graphClientMessage: {
            value: [{ fields: { Title: 'LoggingListId', Value: 'log-list-id' } }],
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          graphClientMessage: {
            mail: 'user@example.org',
          },
        },
      })
      .mockResolvedValueOnce({
        data: { ok: true },
      });

    await getConfiguration();

    await logError(
      {
        message: 'fallback',
        response: {
          data: {
            message: 'HonorNonIndexedQueriesWarningMayFailRandomly details',
            error: { body: 'ignored body' },
          },
        },
      },
      '/path',
      { key: 'value' },
    );

    const lastCall = axios.default.request.mock.calls.at(-1)[0];
    expect(lastCall.method).toBe('post');
    expect(lastCall.data.path).toBe('/sites/site-id/lists/log-list-id/items');
    expect(lastCall.data.data.fields.Title).toBe(
      'HonorNonIndexedQueriesWarningMayFailRandomly details',
    );
  });

  test('logInfo can omit user email when skipEmail is true', async () => {
    const axios = require('axios');
    const { logInfo } = require('./apiProvider');

    axios.default.request
      .mockResolvedValueOnce({
        data: {
          graphClientMessage: {
            value: [{ fields: { Title: 'LoggingListId', Value: 'log-list-id' } }],
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          graphClientMessage: {
            mail: 'user@example.org',
          },
        },
      })
      .mockResolvedValueOnce({
        data: { ok: true },
      });

    await logInfo('Info title', '/path', { key: 1 }, 'ACT', 'affected@example.org', true);

    const lastCall = axios.default.request.mock.calls.at(-1)[0];
    expect(lastCall.data.path).toBe('/sites/site-id/lists/log-list-id/items');
    expect(lastCall.data.data.fields).toMatchObject({
      Title: 'Info title',
      ApiPath: '/path',
      Action: 'ACT',
      AffectedUser: 'affected@example.org',
      UserMail: '',
      Logtype: 'Info',
    });
  });
});
