import { defineWorkspace } from "vitest/config";

// defineWorkspace provides a nice type hinting DX
export default defineWorkspace(["react-app", "lib", "lib/libs/email/content"]);
