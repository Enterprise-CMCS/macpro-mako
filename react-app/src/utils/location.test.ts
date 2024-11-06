import { describe, expect, afterEach, it, beforeEach, vi } from "vitest";

describe('Environment Tests with Constants isProd and isFaqPage', () => {
  beforeEach(() => {
    // Set default values for `hostname` and `pathname` in the global `location` object
    vi.stubGlobal('location', {
      hostname: '',
      pathname: '/',
    });
  });

  afterEach(() => {
    // Restore all global stubs after each test to maintain isolation
    vi.unstubAllGlobals();
  });

  const importLocationModule = async () => {
    // Clear the module cache to force re-evaluation of isProd
    delete require.cache[require.resolve('./location')];
    return await import("./location");
  };

  describe('isProd constant', () => {
    it('should return true when hostname is "mako.cms.gov"', async () => {
      vi.stubGlobal('location', { hostname: 'mako.cms.gov', pathname: '/' });
      const { isProd } = await import("./location"); // Dynamically import for fresh value
      console.log(window.location.hostname);
      expect(isProd).toBe(true);
    });

    console.log(window.location.hostname);

    it('should return true when hostname is "onemac.cms.gov"', async () => {
      vi.stubGlobal('location', { hostname: 'onemac.cms.gov', pathname: '/' });
      const { isProd } = await import("./location");
      console.log(window.location.hostname);
      expect(isProd).toBe(true);
    });

    console.log(window.location.hostname);

    it('should return false for any other hostname', async () => {
      // Test with a hostname not in the allowed list
      vi.stubGlobal('location', { hostname: 'unknownhost.com', pathname: '/' });
      const { isProd } = await import("./location");
      console.log(window.location.hostname);
      expect(isProd).toBe(false);
    });

    console.log(window.location.hostname);
  });

  describe('isFaqPage constant', () => {
    it('should return tre when pathname is "/faq"', async () => {
        vi.stubGlobal('location', { hostname: 'example.com', pathname: '/faq' });
        const { isFaqPage } = await import("./location");
        console.log(window.location.pathname);
        expect(isFaqPage).toBe(true);
      });


    it('should return false when pathname is "/home"', async () => {
      vi.stubGlobal('location', { hostname: 'example.com', pathname: '/home' });
      const { isFaqPage } = await import("./location");
      expect(isFaqPage).toBe(false);
    });

    it('should return false when pathname is "/about"', async () => {
      vi.stubGlobal('location', { hostname: 'example.com', pathname: '/about' });
      const { isFaqPage } = await import("./location");
      expect(isFaqPage).toBe(false);
    });
  });
});

