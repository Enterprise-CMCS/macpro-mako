import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asStateSubmitter } from "../../../.storybook/decorators";
import { StateWelcome } from "./state";

const meta = {
  title: "Feature/StateWelcome",
  component: StateWelcome,
  decorators: [withRouter, asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/",
      },
    }),
  },
} satisfies Meta<typeof StateWelcome>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
