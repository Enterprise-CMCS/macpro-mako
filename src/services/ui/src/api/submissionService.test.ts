import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { API } from "aws-amplify";
import * as unit from "./submissionService";
import { PlanType } from "shared-types";
import { SubmissionServiceEndpoint } from "@/lib";
import { OneMacUser } from "@/api/useGetUser";
import { mockSubmit } from "./mocks";

// const mockPost = vi.fn(async (apiName, path, init) => {
//   switch (path) {
//     case "/getUploadUrl":
//       console.debug("/getUploadUrl intercepted");
//       return await fetch(path, {
//         method: "POST",
//       });
//     case "/upload":
//       return await fetch(path, init);
//     case "/test":
//     default:
//       console.debug("form submission intercepted: ", init.body);
//       return await fetch(path, init);
//   }
// });

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

// describe("submit", () => {
//   beforeAll(() => mockSubmit.server.listen());
//   afterEach(() => mockSubmit.server.resetHandlers());
//   afterAll(() => mockSubmit.server.close());
//   it("processes and submits form data", async () => {
//     API.post = mockPost;
//     const res = await unit.submit({
//       data: mockFormData,
//       endpoint: "/test" as SubmissionServiceEndpoint,
//       user: mockGeorge,
//       authority: PlanType.MED_SPA,
//     });
//     console.log(res);
//     expect(res.body.message).toEqual("pass");
//   });
// });

describe("helpers", () => {
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
      const payload = unit.buildSubmissionPayload(
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
