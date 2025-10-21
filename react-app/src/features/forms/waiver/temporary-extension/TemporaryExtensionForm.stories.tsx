import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asStateSubmitter } from "../../../../../.storybook/decorators";
import { TemporaryExtensionForm } from "./index";

const meta = {
  title: "Form/NewSubmission/Waiver/Temporary Extensions",
  component: TemporaryExtensionForm,
  decorators: [withRouter, asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/new-submission/waiver/temporary-extensions",
      },
    }),
  },
} satisfies Meta<typeof TemporaryExtensionForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
