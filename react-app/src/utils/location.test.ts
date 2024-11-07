import { describe, expect, afterEach, it, beforeEach } from "vitest";
import { isProd } from "./location";
import { isFaqPage } from "./location";

//checking window location hostname
console.log(window.location.hostname);

describe('Environment and Path Tests', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Mock window.location before each test
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        hostname: "localhost", // Default hostname for testing
        pathname: "/", // Default pathname for testing
      },
    });
  });

  describe('isProd constant', () => {
    it('should return true when hostname is "mako.cms.gov"', () => {
      Object.defineProperty(window.location, 'hostname', { value: "mako.cms.gov" });
      expect(isProd).toBe(true);
    });

    it('should return true when hostname is "onemac.cms.gov"', () => {
      Object.defineProperty(window.location, 'hostname', { value: "onemac.cms.gov" });
      expect(isProd).toBe(true);
    });

    it('should return false for any other hostname', () => {
      Object.defineProperty(window.location, 'hostname', { value: "example.com" });
      expect(isProd).toBe(false);
    });
  });

  describe('isFaqPage constant', () => {
    it('should return true when pathname starts with "/faq"', () => {
      Object.defineProperty(window.location, 'pathname', { value: "/faq" });
      expect(isFaqPage).toBe(true);
    });

    it('should return true when pathname is "/faq/any-other-path"', () => {
      Object.defineProperty(window.location, 'pathname', { value: "/faq/any-other-path" });
      expect(isFaqPage).toBe(true);
    });

    it('should return false when pathname is "/home"', () => {
      Object.defineProperty(window.location, 'pathname', { value: "/home" });
      expect(isFaqPage).toBe(false);
    });

    it('should return false when pathname is "/about"', () => {
      Object.defineProperty(window.location, 'pathname', { value: "/about" });
      expect(isFaqPage).toBe(false);
    });
  });

  afterEach(() => {
    // Restore the original window.location after each test
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });
});
