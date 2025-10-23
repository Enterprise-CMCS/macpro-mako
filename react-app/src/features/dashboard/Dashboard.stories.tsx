import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asCmsReviewer, asStateSubmitter } from "../../../.storybook/decorators";
import { Dashboard } from "./index";

const meta = {
  title: "Feature/Dashboard",
  component: Dashboard,
  decorators: [withRouter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/dashboard",
      },
    }),
  },
} satisfies Meta<typeof Dashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StateUser: Story = {
  decorators: [asStateSubmitter],
};

export const CmsUser: Story = {
  decorators: [asCmsReviewer],
};
