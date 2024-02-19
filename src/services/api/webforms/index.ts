export const webforms: Record<string, Record<string, Promise<any>>> = {
  ABP1: {
    v202401: import("./ABP1/v202401"),
    v202402: import("./ABP1/v202402"),
  },
  ABP3: {
    v202401: import("./ABP3/v202401"),
  },
  ABP3_1: {
    v202401: import("./ABP3/v202401"),
  },
  ABP10: {
    v202401: import("./ABP3/v202401"),
  },
};
