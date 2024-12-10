import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transform } from './new-medicaid-submission'
import { events } from 'shared-types';

const file_name = "new-medicaid-submission"
vi.mock('shared-types', () => ({
  events: {
    "new-medicaid-submission": {
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

    (events[file_name].schema.transform as jest.Mock).mockImplementation((callback) =>
      callback(mockData)
    );

    const result = transform(5);

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
    
    (events[file_name].schema.transform as jest.Mock).mockImplementation((callback) =>
      callback(mockData)
    );

    const result = transform(5);

    expect(result).toEqual(expectedResult);
  });
});
