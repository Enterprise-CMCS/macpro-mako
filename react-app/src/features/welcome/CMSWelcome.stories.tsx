import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asCmsReviewer } from "../../../.storybook/decorators";
import { CMSWelcome } from "./cms";

const meta = {
  title: "Feature/CMSWelcome",
  component: CMSWelcome,
  decorators: [withRouter, asCmsReviewer],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/",
      },
    }),
  },
} satisfies Meta<typeof CMSWelcome>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
