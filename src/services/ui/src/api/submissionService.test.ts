import { describe, expect, it } from "vitest";
import * as unit from "./submissionService";
import { OneMacUser } from "@/api/useGetUser";
import { SubmissionServiceEndpoint } from "@/utils";

const mockFormData = {
  test: "data",
  proposedEffectiveDate: new Date(),
  id: "MD-12-3456",
  attachments: {
    test: [new File([""], "test.pdf")],
  },
};

const mockUploadRecipes = (n: number) => {
  const res: unit.UploadRecipe[] = [];
  while (n > 0) {
    res.push({
      key: `test-${n}`,
      url: `/upload/${n}`,
      bucket: `bucket-${n}`,
      data: new File([""], `test-${n}.pdf`),
      title: `title-${n}`,
      name: `name-${n}`,
    });
    n--;
  }
  return res;
};

const mockGeorge: OneMacUser = {
  isCms: false,
  user: {
    sub: "0000aaaa-0000-00aa-0a0a-aaaaaa000000",
    "custom:cms-roles": "onemac-micro-statesubmitter",
    email_verified: true,
    given_name: "George",
    family_name: "Harrison",
    "custom:state": "VA,OH,SC,CO,GA,MD",
    email: "george@example.com",
  },
};

describe("helpers", () => {
  describe("convertFormAttachments", () => {
    it("converts a record of file attachments to an array of key/value pairings", () => {
      const testFile = new File([""], "test.pdf");
      const preTransformed: Record<string, File[]> = {
        test: [testFile],
        testAgain: [testFile, testFile],
      };
      const transformed = unit.buildAttachmentKeyValueArr(preTransformed);
      expect(transformed).toStrictEqual([
        { attachmentKey: "test", file: testFile },
        { attachmentKey: "testAgain", file: testFile },
        { attachmentKey: "testAgain", file: testFile },
      ]);
    });
  });

  describe("urlsToRecipes", () => {
    it("takes pre-signed URLs and attachment key/value pairs and returns the upload recipes array", () => {
      const testFile = new File([""], "test.pdf");
      const res = unit.urlsToRecipes(
        [{ url: "/test", key: "test", bucket: "test-bucket" }],
        [{ attachmentKey: "test", file: testFile }]
      );
      expect(res).toStrictEqual([
        {
          url: "/test",
          key: "test",
          bucket: "test-bucket",
          data: testFile,
          title: "test",
          name: "test.pdf",
        },
      ]);
    });
  });

  describe("buildAttachmentObject", () => {
    it("takes UploadRecipe[] and returns Attachment[]", () => {
      const attachments = unit.buildAttachmentObject(mockUploadRecipes(3));
      expect(attachments).toHaveLength(3);
      expect(attachments[0].key).toEqual("test-3");
      expect(attachments[0].filename).toEqual("name-3");
      expect(attachments[0].title).toEqual("title-3");
      expect(attachments[0].bucket).toEqual("bucket-3");
      expect(attachments[0].uploadDate).not.toBeUndefined();
    });
  });

  describe("buildSubmissionPayload", () => {
    it("builds Action payloads", () => {
      const payload: ReturnType<typeof unit.buildSubmissionPayload> =
        unit.buildSubmissionPayload(
          { test: "data" },
          mockGeorge,
          "/default" as SubmissionServiceEndpoint,
          "MEDICAID",
          mockUploadRecipes(3)
        );
      expect(payload.authority).toEqual("MEDICAID");
      expect(payload.origin).toEqual("micro");
      expect(payload.attachments).toHaveLength(3);
      expect(payload.test).toEqual("data");
    });
  });

  it("builds Submission payloads", () => {
    const payload: ReturnType<typeof unit.buildSubmissionPayload> =
      unit.buildSubmissionPayload(
        mockFormData,
        mockGeorge,
        "/submit",
        "MEDICAID",
        mockUploadRecipes(3)
      );
    expect(payload.authority).toEqual("MEDICAID");
    expect(payload.origin).toEqual("micro");
    expect(payload.attachments).toHaveLength(3);
    expect(payload.test).toEqual("data");
    expect(payload.proposedEffectiveDate).toBeTypeOf("number");
    expect(payload.state).toEqual("MD");
  });
});
