import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asStateSubmitter } from "../../../../../.storybook/decorators";
import { AmendmentForm } from "./Amendment";

const meta = {
  title: "Form/NewSubmission/Waiver/B/Capitated/Amendment/Create",
  component: AmendmentForm,
  decorators: [withRouter, asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/new-submission/waiver/b/capitated/amendment/create",
      },
    }),
  },
} satisfies Meta<typeof AmendmentForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
