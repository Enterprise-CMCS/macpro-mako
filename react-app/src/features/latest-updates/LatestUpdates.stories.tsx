import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { LatestUpdates } from "./index";

const meta = {
  title: "Feature/LatestUpdates",
  component: LatestUpdates,
  decorators: [withRouter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/latestupdates",
      },
    }),
  },
} satisfies Meta<typeof LatestUpdates>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
