jest.mock('./apiProvider', () => ({
  apiPatch: jest.fn(),
  getConfiguration: jest.fn(),
  logInfo: jest.fn(),
}));

const { apiPatch, getConfiguration, logInfo } = require('./apiProvider');
const { saveData } = require('./selfServiceProvider');

const baseUser = {
  id: '77',
  ADUserId: 'ad-1',
  FirstName: 'Jane',
  LastName: 'Doe',
  Country: 'RO',
  NFP: false,
  Phone: '123',
  Gender: 'Female',
  JobTitle: 'Expert',
  Department: 'Air',
  Email: 'jane@example.org',
};

describe('saveData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getConfiguration.mockResolvedValue({
      SharepointSiteId: 'site-id',
      UserListId: 'user-list-id',
    });
  });

  test('saves AD user and SharePoint user for a normal user', async () => {
    apiPatch.mockResolvedValue(undefined);
    logInfo.mockResolvedValue(undefined);

    const result = await saveData(baseUser);

    expect(apiPatch).toHaveBeenNthCalledWith(1, '/users/ad-1', {
      givenName: 'Jane',
      surname: 'Doe',
      displayName: 'Jane Doe (RO)',
      department: 'Eionet',
    });
    expect(apiPatch).toHaveBeenNthCalledWith(
      2,
      '/sites/site-id/lists/user-list-id/items/77',
      expect.objectContaining({
        fields: expect.objectContaining({
          Title: 'Jane Doe',
          Phone: '123',
          Gender: 'Female',
        }),
      }),
    );
    expect(logInfo).toHaveBeenCalledWith(
      'User edited information',
      '',
      baseUser,
      'Edit user',
      'jane@example.org',
    );
    expect(result).toEqual({ Success: true });
  });

  test('uses NFP display name format', async () => {
    apiPatch.mockResolvedValue(undefined);
    logInfo.mockResolvedValue(undefined);

    await saveData({ ...baseUser, NFP: true });

    expect(apiPatch).toHaveBeenNthCalledWith(
      1,
      '/users/ad-1',
      expect.objectContaining({
        displayName: 'Jane Doe (NFP-RO)',
      }),
    );
  });

  test('returns wrapped error when AD update fails', async () => {
    const error = new Error('ad failed');
    apiPatch.mockRejectedValueOnce(error);

    const result = await saveData(baseUser);

    expect(result).toEqual({
      Message: 'saveADUser',
      Error: error,
      Success: false,
    });
    expect(logInfo).not.toHaveBeenCalled();
  });

  test('returns wrapped error when SharePoint update fails', async () => {
    const error = new Error('sp failed');
    apiPatch.mockResolvedValueOnce(undefined).mockRejectedValueOnce(error);

    const result = await saveData(baseUser);

    expect(result).toEqual({
      Message: 'saveSPUser',
      Error: error,
      Success: false,
    });
    expect(logInfo).not.toHaveBeenCalled();
  });
});
