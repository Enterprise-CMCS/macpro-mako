import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asStateSubmitter } from "../../../.storybook/decorators";
import { B4WaiverSubmissionOptions } from "./plan-types";

const meta = {
  title: "Form/NewSubmission/Waiver/B/B4",
  component: B4WaiverSubmissionOptions,
  decorators: [withRouter, asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/new-submission/waiver/b/b4",
      },
    }),
  },
} satisfies Meta<typeof B4WaiverSubmissionOptions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
