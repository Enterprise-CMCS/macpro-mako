import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asStateSubmitter } from "../../../.storybook/decorators";
import { WaiverSubmissionOptions } from "./plan-types";

const meta = {
  title: "Form/NewSubmission/Waiver",
  component: WaiverSubmissionOptions,
  decorators: [withRouter, asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/new-submission/waiver",
      },
    }),
  },
} satisfies Meta<typeof WaiverSubmissionOptions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
