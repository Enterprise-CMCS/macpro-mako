declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    __gaUserRoleSet?: boolean;
  }
}

export { };
