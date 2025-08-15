import { dataService } from 'librechat-data-provider';

jest.mock('librechat-data-provider', () => ({
  dataService: {
    getMemories: jest.fn(),
  },
}));

describe('getMemories', () => {
  it('should fetch memories from /api/memories', async () => {
    const mockData = [{ key: 'foo', value: 'bar', updated_at: '2024-05-01T00:00:00Z' }];
    (dataService as any).getMemories.mockResolvedValueOnce(mockData);

    const result = await (dataService as any).getMemories();

    expect((dataService as any).getMemories).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockData);
  });
});
