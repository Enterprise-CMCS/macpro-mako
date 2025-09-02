import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asStateSubmitter } from "../../../.storybook/decorators";
import { StateSignup } from "./stateSignup";

const meta = {
  title: "Feature/State Sign Up",
  component: StateSignup,
  decorators: [withRouter, asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/signup/state",
      },
    }),
  },
} satisfies Meta<typeof StateSignup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
