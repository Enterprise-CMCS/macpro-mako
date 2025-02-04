import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { getDomain, getOsNamespace, getDomainAndNamespace } from "./utils";
import { BaseIndex } from "lib/packages/shared-types/opensearch";

describe("utils", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("getDomain", () => {
    it("should return osDomain when defined", () => {
      process.env.osDomain = "https://test-domain.com";
      expect(getDomain()).toBe("https://test-domain.com");
    });

    it("should throw error when osDomain is not defined", () => {
      delete process.env.osDomain;
      expect(() => getDomain()).toThrow("process.env.osDomain must be defined");
    });
  });

  describe("getOsNamespace", () => {
    it("should combine indexNamespace with baseIndex", () => {
      process.env.indexNamespace = "test-";
      const baseIndex: BaseIndex = "main";
      expect(getOsNamespace(baseIndex)).toBe("test-main");
    });

    it("should throw error when indexNamespace is not defined", () => {
      delete process.env.indexNamespace;
      const baseIndex: BaseIndex = "main";
      expect(() => getOsNamespace(baseIndex)).toThrow("process.env.indexNamespace must be defined");
    });
  });

  describe("getDomainAndNamespace", () => {
    it("should return domain and combined index", () => {
      process.env.osDomain = "https://test-domain.com";
      process.env.indexNamespace = "test-";
      const baseIndex: BaseIndex = "main";

      expect(getDomainAndNamespace(baseIndex)).toEqual({
        domain: "https://test-domain.com",
        index: "test-main",
      });
    });

    it("should throw error when osDomain is not defined", () => {
      delete process.env.osDomain;
      process.env.indexNamespace = "test-";
      const baseIndex: BaseIndex = "main";

      expect(() => getDomainAndNamespace(baseIndex)).toThrow(
        "process.env.osDomain must be defined",
      );
    });

    it("should throw error when indexNamespace is not defined", () => {
      process.env.osDomain = "https://test-domain.com";
      delete process.env.indexNamespace;
      const baseIndex: BaseIndex = "main";

      expect(() => getDomainAndNamespace(baseIndex)).toThrow(
        "process.env.indexNamespace must be defined",
      );
    });
  });
});
