import { defineWorkspace } from "vitest/config";
import { join } from "path";
import react from "@vitejs/plugin-react-swc";

export default defineWorkspace(["react-app", "lib", "lib/libs/email"]);
