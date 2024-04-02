import { beforeEach, describe, expect, it, vi } from "vitest";
import { API } from "aws-amplify";
import { mockForm } from "./mocks";
import * as unit from "./useGetForm";

describe("getForm", () => {
  beforeEach(() => {
    API.post = vi.fn();
  });

  it("makes an AWS Amplify request without a form version", async () => {
    await unit.getForm("test-id");
    expect(API.post).toHaveBeenCalledWith("os", "/forms", {
      body: { formId: "test-id", formVersion: undefined },
    });
  });

  it("makes an AWS Amplify request with a form version", async () => {
    await unit.getForm("test-id", "test-version");
    expect(API.post).toHaveBeenCalledWith("os", "/forms", {
      body: { formId: "test-id", formVersion: "test-version" },
    });
  });
});

// describe("useGetForm", () => {
// it("makes an AWS Amplify request without a form version", () => {
//   API.post = vi.fn();
//   unit.useGetForm("test-id");
//   expect(API.post).toHaveBeenCalledWith("os", "/forms", {
//     body: { formId: "test-id", formVersion: undefined },
//   });
// });
// it("makes an AWS Amplify request with a form version", async () => {
//   await unit.useGetForm("test-id", "test-version");
//   expect(API.post).toHaveBeenCalledWith("os", "/forms", {
//     body: { formId: "test-id", formVersion: "test-version" },
//   });
// });
// });
