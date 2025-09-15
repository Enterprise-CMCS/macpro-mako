import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asStateSubmitter } from "../../../.storybook/decorators";
import { BWaiverSubmissionOptions } from "./plan-types";

const meta = {
  title: "Form/NewSubmission/Waiver/B",
  component: BWaiverSubmissionOptions,
  decorators: [withRouter, asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/new-submission/waiver/b",
      },
    }),
  },
} satisfies Meta<typeof BWaiverSubmissionOptions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
