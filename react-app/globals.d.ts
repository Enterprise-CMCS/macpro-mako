declare global {
  // Set by Playwright e2e fixtures via context.addInitScript

  var __MAKO_E2E__: boolean | undefined;

  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    __gaUserRoleSet?: boolean;
  }
}

export {};
