import type { Meta, StoryObj } from "@storybook/react-vite";
import { TEST_REVIEWER_USERNAME, TEST_STATE_SUBMITTER_USERNAME } from "mocks";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

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
  parameters: {
    username: null,
  },
};

export const StateUser: Story = {
  parameters: {
    username: TEST_STATE_SUBMITTER_USERNAME,
  },
};

export const CMSUser: Story = {
  parameters: {
    username: TEST_REVIEWER_USERNAME,
  },
};
