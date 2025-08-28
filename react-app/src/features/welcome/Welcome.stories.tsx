import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asCmsReviewer, asLoggedOut, asStateSubmitter } from "../../../.storybook/decorators";
import { WelcomeWrapper } from "./wrapper";

const meta = {
  title: "Feature/Welcome",
  component: WelcomeWrapper,
  decorators: [withRouter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/",
      },
    }),
  },
} satisfies Meta<typeof WelcomeWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {
  name: "Logged Out",
  decorators: [asLoggedOut],
};

export const CMSWelcome: Story = {
  name: "CMS Welcome",
  decorators: [asCmsReviewer],
  parameters: {
    flags: {
      "cms-home-page": "ON",
    },
  },
};

export const StateWelcome: Story = {
  name: "State Welcome",
  decorators: [asStateSubmitter],
  parameters: {
    flags: {
      "state-home-page": "ON",
    },
  },
};
