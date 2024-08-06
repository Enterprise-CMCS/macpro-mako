import { execSync } from "child_process";
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import * as utils from "./utils";

vi.mock("child_process", () => ({
  execSync: vi.fn(),
}));

describe("utils", () => {
  const mockDate = new Date(1627891234567);

  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe("cleanupFolder", () => {
    it("should clean up the folder", () => {
      const folderToClean = "/tmp/test_folder/";
      const lsOutputBefore = Buffer.from("file1\nfile2");
      const lsOutputAfter = Buffer.from("");

      (execSync as any).mockImplementation((cmd: string) => {
        if (cmd.includes("ls -l")) {
          return cmd.includes("*") ? lsOutputAfter : lsOutputBefore;
        }
        return Buffer.from("");
      });

      console.log = vi.fn();

      utils.cleanupFolder(folderToClean);

      expect(execSync).toHaveBeenCalledWith(`ls -l ${folderToClean}`);
      expect(console.log).toHaveBeenCalledWith("-- Folder before cleanup--");
      expect(console.log).toHaveBeenCalledWith(lsOutputBefore.toString());
      expect(execSync).toHaveBeenCalledWith(`rm -rf ${folderToClean}*`);
      expect(execSync).toHaveBeenCalledWith(`ls -l ${folderToClean}`);
      expect(console.log).toHaveBeenCalledWith("-- Folder after cleanup --");
    });
  });

  describe("extractS3EventFromSQSEvent", () => {
    it("should extract and parse the S3 event from the SQS event", () => {
      const sqsEvent = {
        Records: [
          {
            body: JSON.stringify({
              Records: [{ s3: { object: { key: "test-key" } } }],
            }),
          },
        ],
      };

      const s3Event = utils.extractS3EventFromSQSEvent(sqsEvent);
      expect(s3Event).toEqual({
        Records: [{ s3: { object: { key: "test-key" } } }],
      });
    });

    it("should throw an error if body is missing", () => {
      const sqsEvent = { Records: [{}] };

      expect(() => utils.extractS3EventFromSQSEvent(sqsEvent)).toThrow(
        "Unable to retrieve body from the SQS event",
      );
    });
  });

  describe("extractKeyFromS3Event", () => {
    it("should extract the key from the S3 event", () => {
      const s3Event = { Records: [{ s3: { object: { key: "test%20key" } } }] };

      const key = utils.extractKeyFromS3Event(s3Event);
      expect(key).toBe("test key");
    });

    it("should throw an error if key is missing", () => {
      const s3Event = { Records: [{}] };

      expect(() => utils.extractKeyFromS3Event(s3Event)).toThrow(
        "Unable to retrieve key information from the event",
      );
    });
  });

  describe("extractBucketFromS3Event", () => {
    it("should extract the bucket from the S3 event", () => {
      const s3Event = {
        Records: [{ s3: { bucket: { name: "test-bucket" } } }],
      };

      const bucket = utils.extractBucketFromS3Event(s3Event);
      expect(bucket).toBe("test-bucket");
    });

    it("should throw an error if bucket name is missing", () => {
      const s3Event = { Records: [{}] };

      expect(() => utils.extractBucketFromS3Event(s3Event)).toThrow(
        "Unable to retrieve bucket information from the event",
      );
    });
  });
});
