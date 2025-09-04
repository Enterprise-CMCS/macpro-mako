import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asStateSubmitter } from "../../../.storybook/decorators";
import { StateConfirmation } from "./stateConfirmation";

const meta = {
  title: "Feature/State Sign Up Confirmation",
  component: StateConfirmation,
  decorators: [withRouter, asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/signup/state/role/confirm",
      },
    }),
  },
} satisfies Meta<typeof StateConfirmation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MDadmin: Story = {
  name: "Maryland - State System Admin",
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        searchParams: { states: "MD", role: "statesystemadmin" },
      },
    }),
  },
};

export const MDVAOHsubmitter: Story = {
  name: "Maryland, Virginia, Ohio - State Submitter",
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        searchParams: { states: "MD,VA,OH", role: "statesubmitter" },
      },
    }),
  },
};
