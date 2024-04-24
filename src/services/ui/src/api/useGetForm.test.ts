import { beforeEach, describe, expect, it, vi } from "vitest";
import { API } from "aws-amplify";
import * as unit from "./useGetForm";

describe("getForm", () => {
  beforeEach(() => {
    API.post = vi.fn();
  });

  describe("makes an AWS Amplify request", () => {
    it("without a form version", async () => {
      await unit.getForm("test-id");
      expect(API.post).toHaveBeenCalledWith("os", "/forms", {
        body: { formId: "test-id", formVersion: undefined },
      });
      expect(API.post).not.toThrowError();
    });

    it("with a form version", async () => {
      await unit.getForm("test-id", "test-version");
      expect(API.post).toHaveBeenCalledWith("os", "/forms", {
        body: { formId: "test-id", formVersion: "test-version" },
      });
      expect(API.post).not.toThrowError();
    });
  });
});

describe("getAllForms", () => {
  beforeEach(() => {
    API.get = vi.fn();
  });

  it("makes an AWS Amplify request for all forms", async () => {
    await unit.getAllForms();
    expect(API.get).toHaveBeenCalledWith("os", "/allForms", {});
    expect(API.get).not.toThrowError();
  });
});
