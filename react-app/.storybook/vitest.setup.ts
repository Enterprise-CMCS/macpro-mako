import { setProjectAnnotations } from "@storybook/react-vite";

import * as previewAnnotations from "./preview";

const annotations = setProjectAnnotations([previewAnnotations]);
