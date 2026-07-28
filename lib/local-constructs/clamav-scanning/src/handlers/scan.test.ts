import { expect, test, vi } from "vitest";

import {
  checkFileExt,
  checkFileSize,
  downloadAVDefinitions,
  downloadFileFromS3,
  extractBucketFromS3Event,
  extractKeyFromS3Event,
  scanLocalFile,
  startClamd,
  STATUS_CLEAN_FILE,
  STATUS_ERROR_PROCESSING_FILE,
  tagWithScanStatus,
} from "./../lib";
import { handler, isTransientScanError } from "./scan";

const { unlinkMock } = vi.hoisted(() => ({
  unlinkMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("fs/promises", () => ({
  default: {
    unlink: unlinkMock,
  },
  unlink: unlinkMock,
}));

vi.mock("pino", () => {
  return {
    default: vi.fn().mockReturnValue({
      info: vi.fn(),
      error: vi.fn(),
    }),
  };
});

vi.mock("./../lib", () => ({
  startClamd: vi.fn(),
  downloadAVDefinitions: vi.fn(),
  scanLocalFile: vi.fn(),
  extractKeyFromS3Event: vi.fn(),
  extractBucketFromS3Event: vi.fn(),
  STATUS_ERROR_PROCESSING_FILE: "STATUS_ERROR_PROCESSING_FILE",
  downloadFileFromS3: vi.fn(),
  tagWithScanStatus: vi.fn(),
  checkFileExt: vi.fn(),
  STATUS_CLEAN_FILE: "STATUS_CLEAN_FILE",
  checkFileSize: vi.fn(),
}));

const mockEvent = {
  Records: [
    {
      body: JSON.stringify({
        // SQS message body
        Records: [
          {
            s3: {
              bucket: {
                name: "test-bucket",
              },
              object: {
                key: "test-key",
              },
            },
          },
        ],
      }),
    },
  ],
};

test("should stay alive when event.keepalive is true", async () => {
  const result = await handler({ keepalive: true });
  expect(result).toEqual(["Staying alive"]);
});

test("should handle event and return scan results", async () => {
  (downloadAVDefinitions as any).mockResolvedValueOnce(undefined);
  (startClamd as any).mockResolvedValueOnce(undefined);
  (extractKeyFromS3Event as any).mockReturnValueOnce("test-key");
  (extractBucketFromS3Event as any).mockReturnValueOnce("test-bucket");
  (checkFileSize as any).mockResolvedValueOnce(STATUS_CLEAN_FILE);
  (downloadFileFromS3 as any).mockResolvedValueOnce("file-location");
  (checkFileExt as any).mockResolvedValueOnce(STATUS_CLEAN_FILE);
  (scanLocalFile as any).mockResolvedValueOnce(STATUS_CLEAN_FILE);
  (tagWithScanStatus as any).mockResolvedValueOnce(undefined);
  unlinkMock.mockClear();

  const result = await handler(mockEvent);

  expect(downloadAVDefinitions).toHaveBeenCalled();
  expect(startClamd).toHaveBeenCalled();
  expect(extractKeyFromS3Event).toHaveBeenCalled();
  expect(extractBucketFromS3Event).toHaveBeenCalled();
  expect(checkFileSize).toHaveBeenCalledWith("test-key", "test-bucket");
  expect(downloadFileFromS3).toHaveBeenCalledWith("test-key", "test-bucket");
  expect(checkFileExt).toHaveBeenCalledWith("file-location");
  expect(scanLocalFile).toHaveBeenCalledWith("file-location");
  expect(tagWithScanStatus).toHaveBeenCalledTimes(1);
  expect(tagWithScanStatus).toHaveBeenCalledWith("test-bucket", "test-key", STATUS_CLEAN_FILE);
  expect(unlinkMock).toHaveBeenCalledWith("file-location");
  expect(result).toEqual([STATUS_CLEAN_FILE]);
});

test("should handle errors during event processing", async () => {
  (downloadAVDefinitions as any).mockResolvedValueOnce(undefined);
  (startClamd as any).mockResolvedValueOnce(undefined);
  (extractKeyFromS3Event as any).mockImplementationOnce(() => {
    throw new Error("Error extracting key");
  });

  const result = await handler(mockEvent);

  expect(downloadAVDefinitions).toHaveBeenCalled();
  expect(startClamd).toHaveBeenCalled();
  expect(extractKeyFromS3Event).toHaveBeenCalled();
  expect(result).toEqual([STATUS_ERROR_PROCESSING_FILE]);
});

test("should cleanup local download and avoid ERROR tag on ENOSPC", async () => {
  const enospc = Object.assign(new Error("ENOSPC: no space left on device, write"), {
    code: "ENOSPC",
  });

  (downloadAVDefinitions as any).mockResolvedValueOnce(undefined);
  (startClamd as any).mockResolvedValueOnce(undefined);
  (extractKeyFromS3Event as any).mockReturnValueOnce("test-key");
  (extractBucketFromS3Event as any).mockReturnValueOnce("test-bucket");
  (checkFileSize as any).mockResolvedValueOnce(STATUS_CLEAN_FILE);
  (downloadFileFromS3 as any).mockResolvedValueOnce("file-location");
  (checkFileExt as any).mockResolvedValueOnce(STATUS_CLEAN_FILE);
  (scanLocalFile as any).mockRejectedValueOnce(enospc);
  unlinkMock.mockClear();

  await expect(handler(mockEvent)).rejects.toThrow(/ENOSPC/);
  expect(tagWithScanStatus).not.toHaveBeenCalled();
  expect(unlinkMock).toHaveBeenCalledWith("file-location");
});

test("isTransientScanError detects disk-full failures", () => {
  expect(isTransientScanError(Object.assign(new Error("write failed"), { code: "ENOSPC" }))).toBe(
    true,
  );
  expect(isTransientScanError(new Error("ENOSPC: no space left on device, write"))).toBe(true);
  expect(isTransientScanError(new Error("AccessDenied"))).toBe(false);
});
