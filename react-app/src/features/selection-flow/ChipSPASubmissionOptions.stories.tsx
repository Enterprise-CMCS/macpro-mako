import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asStateSubmitter } from "../../../.storybook/decorators";
import { ChipSPASubmissionOptions } from "./plan-types";

const meta = {
  title: "Form/NewSubmission/SPA/CHIP",
  component: ChipSPASubmissionOptions,
  decorators: [withRouter, asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/new-submission/spa/chip",
      },
    }),
  },
} satisfies Meta<typeof ChipSPASubmissionOptions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
