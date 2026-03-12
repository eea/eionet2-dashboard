jest.mock('./apiProvider', () => ({
  apiGet: jest.fn(),
  getConfiguration: jest.fn(),
}));

const { apiGet, getConfiguration } = require('./apiProvider');
const { getFlows } = require('./reportingProvider');

describe('getFlows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns empty array when country is missing', async () => {
    const result = await getFlows();

    expect(result).toEqual([]);
    expect(getConfiguration).not.toHaveBeenCalled();
    expect(apiGet).not.toHaveBeenCalled();
  });

  test('maps paginated graph response and capitalizes status', async () => {
    getConfiguration.mockResolvedValue({
      SharepointSiteId: 'site-id',
      ReportnetFlowsListId: 'flows-id',
    });

    apiGet
      .mockResolvedValueOnce({
        graphClientMessage: {
          value: [
            {
              id: '1',
              fields: {
                Country: 'RO',
                DataflowId: 'DF-1',
                DataflowName: 'Flow one',
                DataflowURL: 'https://flow-1',
                ObligationName: 'Obl',
                ObligationURL: 'https://obl',
                LegalInstrumentName: 'Law',
                LegalInstrumentURL: 'https://law',
                DeadlineDate: '2025-10-01',
                Status: 'IN_PROGRESS',
                ReporterEmails: 'a@example.org,b@example.org',
                FirstReleaseDate: '2025-01-01',
                LastReleaseDate: '2025-01-02',
                DeliveryStatus: 'ok',
                IsEEACore: true,
              },
            },
          ],
          '@odata.nextLink': 'next-page',
        },
      })
      .mockResolvedValueOnce({
        graphClientMessage: {
          value: [
            {
              id: '2',
              fields: {
                Country: 'RO',
                DataflowId: 'DF-2',
                DataflowName: 'Flow two',
                Status: 'DONE',
              },
            },
          ],
        },
      });

    const result = await getFlows('RO');

    expect(apiGet).toHaveBeenCalledTimes(2);
    expect(apiGet.mock.calls[0][0]).toContain("$filter=fields/Country eq 'RO'");
    expect(apiGet.mock.calls[1][0]).toBe('next-page');
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(
      expect.objectContaining({
        id: '1',
        country: 'RO',
        status: 'In progress',
        reporterEmails: ['a@example.org', 'b@example.org'],
      }),
    );
    expect(result[0].deadlineDate).toBeInstanceOf(Date);
    expect(result[0].firstReleaseDate).toBeInstanceOf(Date);
    expect(result[0].lastReleaseDate).toBeInstanceOf(Date);
    expect(result[1].status).toBe('Done');
  });

  test('returns empty array when api call fails', async () => {
    getConfiguration.mockResolvedValue({
      SharepointSiteId: 'site-id',
      ReportnetFlowsListId: 'flows-id',
    });
    apiGet.mockRejectedValue(new Error('boom'));

    const result = await getFlows('RO');

    expect(result).toEqual([]);
  });
});
