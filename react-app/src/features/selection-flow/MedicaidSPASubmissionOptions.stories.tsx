import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asStateSubmitter } from "../../../.storybook/decorators";
import { MedicaidSPASubmissionOptions } from "./plan-types";

const meta = {
  title: "Form/NewSubmission/SPA/Medicaid",
  component: MedicaidSPASubmissionOptions,
  decorators: [withRouter, asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/new-submission/spa/medicaid",
      },
    }),
  },
} satisfies Meta<typeof MedicaidSPASubmissionOptions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
