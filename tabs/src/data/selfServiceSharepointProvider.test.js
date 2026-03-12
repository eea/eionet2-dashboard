jest.mock('./apiProvider', () => ({
  apiGet: jest.fn(),
  getConfiguration: jest.fn(),
}));

const { apiGet, getConfiguration } = require('./apiProvider');
const {
  getOrganisationList,
  getSPUserByMail,
  getGenderList,
} = require('./selfServiceSharepointProvider');

describe('selfServiceSharepointProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getConfiguration.mockResolvedValue({
      SharepointSiteId: 'site-id',
      OrganisationListId: 'org-list-id',
      UserListId: 'user-list-id',
    });
  });

  test('getOrganisationList maps organisations and applies country filter', async () => {
    apiGet.mockResolvedValue({
      graphClientMessage: {
        value: [
          {
            id: 10,
            fields: {
              Title: 'Org 1',
              Unspecified: false,
            },
          },
        ],
      },
    });

    const result = await getOrganisationList('RO');

    expect(apiGet).toHaveBeenCalledWith(
      expect.stringContaining("$filter=fields/Country eq 'RO' or fields/Unspecified eq 1"),
    );
    expect(result).toEqual([
      {
        header: 'Org 1',
        content: 10,
        unspecified: false,
      },
    ]);
  });

  test('getSPUserByMail returns first user and escapes apostrophe', async () => {
    apiGet.mockResolvedValue({
      graphClientMessage: {
        value: [{ id: 1, fields: { Email: 'o@example.org' } }],
      },
    });

    const result = await getSPUserByMail("o'hara@example.org");

    expect(apiGet).toHaveBeenCalledWith(expect.stringContaining("o''hara%40example.org"));
    expect(result).toEqual({ id: 1, fields: { Email: 'o@example.org' } });
  });

  test('getSPUserByMail returns undefined when no result exists', async () => {
    apiGet.mockResolvedValue({
      graphClientMessage: {
        value: [],
      },
    });

    const result = await getSPUserByMail('none@example.org');

    expect(result).toBeUndefined();
  });

  test('getGenderList returns choices from Gender column', async () => {
    apiGet.mockResolvedValue({
      graphClientMessage: {
        value: [{ name: 'Title' }, { name: 'Gender', choice: { choices: ['Female', 'Male'] } }],
      },
    });

    const result = await getGenderList();

    expect(result).toEqual(['Female', 'Male']);
  });

  test('getGenderList returns empty array when Gender column is missing', async () => {
    apiGet.mockResolvedValue({
      graphClientMessage: {
        value: [{ name: 'Title' }],
      },
    });

    const result = await getGenderList();

    expect(result).toEqual([]);
  });
});
