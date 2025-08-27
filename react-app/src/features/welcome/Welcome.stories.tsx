import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asLoggedOut } from "../../../.storybook/decorators";
import { WelcomeWrapper } from "./wrapper";

const meta = {
  title: "Feature/Welcome",
  component: WelcomeWrapper,
  decorators: [withRouter, asLoggedOut],
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

export const Default: Story = {};
