import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asStateSubmitter } from "../../../.storybook/decorators";
import { StateRoleSignup } from "./stateRoleSignup";

const meta = {
  title: "Feature/State Role Sign Up",
  component: StateRoleSignup,
  decorators: [withRouter, asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/signup/state/role",
      },
    }),
    flags: {
      "show-user-role-updates": true,
    },
  },
} satisfies Meta<typeof StateRoleSignup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MD: Story = {
  name: "Maryland",
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        searchParams: { states: "MD" },
      },
    }),
  },
};

export const MDVAOH: Story = {
  name: "Maryland, Virginia, Ohio",
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        searchParams: { states: "MD,VA,OH" },
      },
    }),
  },
};
