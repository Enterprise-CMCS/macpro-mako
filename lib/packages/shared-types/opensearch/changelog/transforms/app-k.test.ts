import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transform } from './app-k'
import { events } from 'shared-types';

vi.mock('shared-types', () => ({
  events: {
    "app-k": {
      schema: {
        transform: vi.fn(),
      },
    },
  },
}));

describe('transform function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should transform data with valid attachments', () => {
    // Mock data
    const mockData = {
      id: '123',
      attachments: {
        doc1: {
            label: 'Document 1',
            files: [
              { filename: 'file1.pdf', bucket: 'bucket1', key: 'key1', uploadDate: '2024-01-01' },
            ],
          },
        doc2: {
            label: 'Document 2',
            files: [
              { filename: 'file2.pdf', bucket: 'bucket2', key: 'key1', uploadDate: '2024-01-01' },
              { filename: 'file3.pdf', bucket: 'bucket2', key: 'key1', uploadDate: '2024-01-01' },
            ],
          },
      },
    };

    const expectedResult = {
        id: '123-5',
        attachments: [
          {
            filename: 'file1.pdf',
            title: 'Document 1',
            bucket: 'bucket1',
            key: 'key1',
            uploadDate: '2024-01-01'
          },
          {
            filename: 'file2.pdf',
            title: 'Document 2',
            bucket: 'bucket2',
            key: 'key1',
            uploadDate: '2024-01-01'
          },
          {
            filename: 'file3.pdf',
            title: 'Document 2',
            bucket: 'bucket2',
            key: 'key1',
            uploadDate: '2024-01-01'
          }
        ],
        packageId: '123'
      };

    // Mock the transform method
    (events['app-k'].schema.transform as jest.Mock).mockImplementation((callback) =>
      callback(mockData)
    );

    // Call the function
    const result = transform(5);

    // Assertions
    expect(events['app-k'].schema.transform).toHaveBeenCalledTimes(1);
    console.log(result)
    expect(result).toEqual(expectedResult);
  });

  it('should handle attachments with empty files array', () => {
    const mockData = {
      id: '123',
      attachments: {
        doc1: {
          label: 'Document 1',
          files: [],
        },
      },
    };

    const expectedResult = {
      ...mockData,
      attachments: [],
      packageId: '123',
      id: '123-5',
    };
    
    (events['app-k'].schema.transform as jest.Mock).mockImplementation((callback) =>
      callback(mockData)
    );

    const result = transform(5);

    expect(result).toEqual(expectedResult);
  });
});
