import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asStateSubmitter } from "../../../.storybook/decorators";
import { WebformsList } from "./WebformsList";

const meta = {
  title: "Webforms/List",
  component: WebformsList,
  decorators: [withRouter, asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/webforms",
      },
    }),
  },
} satisfies Meta<typeof WebformsList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
