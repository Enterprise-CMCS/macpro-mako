import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asStateSubmitter } from "../../../.storybook/decorators";
import { BCapWaiverSubmissionOptions } from "./plan-types";

const meta = {
  title: "Form/NewSubmission/Waiver/B/Capitated",
  component: BCapWaiverSubmissionOptions,
  decorators: [withRouter, asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/new-submission/waiver/b/capitated",
      },
    }),
  },
} satisfies Meta<typeof BCapWaiverSubmissionOptions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
