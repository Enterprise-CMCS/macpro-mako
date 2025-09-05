import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asStateSubmitter } from "../../../../.storybook/decorators";
import { ChipDetailsForm } from "./ChipDetails";

const meta = {
  title: "Form/NewSubmission/SPA/CHIP/Create/CHIP Details",
  component: ChipDetailsForm,
  decorators: [withRouter, asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/new-submission/spa/chip/create/chip-details",
      },
    }),
  },
} satisfies Meta<typeof ChipDetailsForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
