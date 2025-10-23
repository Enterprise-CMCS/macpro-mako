import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asStateSubmitter } from "../../../.storybook/decorators";
import { NewSubmissionInitialOptions } from "./plan-types";

const meta = {
  title: "Form/NewSubmission/Initial",
  component: NewSubmissionInitialOptions,
  decorators: [withRouter, asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/new-submission",
      },
    }),
  },
} satisfies Meta<typeof NewSubmissionInitialOptions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
