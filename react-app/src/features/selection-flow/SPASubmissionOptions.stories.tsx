import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asStateSubmitter } from "../../../.storybook/decorators";
import { SPASubmissionOptions } from "./plan-types";

const meta = {
  title: "Form/NewSubmission/SPA",
  component: SPASubmissionOptions,
  decorators: [withRouter, asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/new-submission/spa",
      },
    }),
  },
} satisfies Meta<typeof SPASubmissionOptions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
