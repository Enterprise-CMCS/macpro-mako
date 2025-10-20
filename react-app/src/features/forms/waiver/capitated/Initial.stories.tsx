import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asStateSubmitter } from "../../../../../.storybook/decorators";
import { InitialForm } from "./Initial";

const meta = {
  title: "Form/NewSubmission/Waiver/B/Capitated/Initial/Create",
  component: InitialForm,
  decorators: [withRouter, asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/new-submission/waiver/b/capitated/initial/create",
      },
    }),
  },
} satisfies Meta<typeof InitialForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
