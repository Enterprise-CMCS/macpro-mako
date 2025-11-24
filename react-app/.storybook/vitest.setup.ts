import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/react-vite";
import { beforeAll } from "vitest";

import * as previewAnnotations from "./preview";

// Disable Storybook preview + MSW during Vitest if env variable set
const disableMsw = process.env.STORYBOOK_DISABLE_MSW === "true" || typeof window === "undefined";

const baseAnnotations = [a11yAddonAnnotations];

const annotations = setProjectAnnotations(
  disableMsw ? baseAnnotations : [...baseAnnotations, previewAnnotations],
);

if (annotations.beforeAll) {
  beforeAll(annotations.beforeAll);
}
