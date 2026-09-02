let skipCleanupNestLevel = 0;

export const skipCleanup = () => {
  skipCleanupNestLevel += 1;
  process.env.SKIP_CLEANUP = "true";
};

export const allowCleanup = () => {
  skipCleanupNestLevel = Math.max(0, skipCleanupNestLevel - 1);
  if (skipCleanupNestLevel === 0) {
    delete process.env.SKIP_CLEANUP;
  }
};

/** Clear nest level and env so one file cannot poison the next in a shared worker. */
export const resetSkipCleanup = () => {
  skipCleanupNestLevel = 0;
  delete process.env.SKIP_CLEANUP;
};

export const shouldSkipCleanup = (): boolean =>
  skipCleanupNestLevel > 0 || Boolean(process.env.SKIP_CLEANUP);

export const mockApiRefinements = () => {
  process.env.MOCK_API_REFINES = "true";
};
