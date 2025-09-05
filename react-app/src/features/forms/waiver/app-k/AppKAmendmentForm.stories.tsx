import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asStateSubmitter } from "../../../../../.storybook/decorators";
import { AppKAmendmentForm } from "./index";

const meta = {
  title: "Form/NewSubmission/Waiver/Appendix K",
  component: AppKAmendmentForm,
  decorators: [withRouter, asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/new-submission/waiver/app-k",
      },
    }),
  },
} satisfies Meta<typeof AppKAmendmentForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
