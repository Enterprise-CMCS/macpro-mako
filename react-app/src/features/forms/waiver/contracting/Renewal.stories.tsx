import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asStateSubmitter } from "../../../../../.storybook/decorators";
import { RenewalForm } from "./Renewal";

const meta = {
  title: "Form/NewSubmission/Waiver/B/B4/Renewal/Create",
  component: RenewalForm,
  decorators: [withRouter, asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/new-submission/waiver/b/b4/renewal/create",
      },
    }),
  },
} satisfies Meta<typeof RenewalForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
