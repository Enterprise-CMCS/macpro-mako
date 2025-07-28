import { defineWorkspace } from "vitest/config";

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineWorkspace(["react-app", "lib", "lib/libs/email"]);
