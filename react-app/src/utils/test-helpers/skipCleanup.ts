export const skipCleanup = () => {
  process.env.SKIP_CLEANUP = "true";
};

export const mockApiRefinements = () => {
  process.env.MOCK_API_REFINES = "true";
};
