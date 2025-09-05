import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asStateSubmitter } from "../../../../.storybook/decorators";
import { ChipForm } from "./Chip";

const meta = {
  title: "Form/NewSubmission/SPA/CHIP/Create",
  component: ChipForm,
  decorators: [withRouter, asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/new-submission/spa/chip/create",
      },
    }),
  },
} satisfies Meta<typeof ChipForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
