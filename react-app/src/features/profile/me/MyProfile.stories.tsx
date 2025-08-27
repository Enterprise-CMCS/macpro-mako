import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asCmsReviewer, asStateSubmitter } from "../../../../.storybook/decorators";
import { MyProfile } from "./index";

const meta = {
  title: "Feature/MyProfile",
  component: MyProfile,
  decorators: [withRouter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/profile",
      },
    }),
  },
} satisfies Meta<typeof MyProfile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StateUser: Story = {
  decorators: [asStateSubmitter],
};

export const CmsUser: Story = {
  decorators: [asCmsReviewer],
};
