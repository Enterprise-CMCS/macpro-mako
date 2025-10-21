import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asStateSubmitter } from "../../../../../.storybook/decorators";
import { AmendmentForm } from "./Amendment";

const meta = {
  title: "Form/NewSubmission/Waiver/B/B4/Amendment/Create",
  component: AmendmentForm,
  decorators: [withRouter, asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/new-submission/waiver/b/b4/amendment/create",
      },
    }),
  },
} satisfies Meta<typeof AmendmentForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
