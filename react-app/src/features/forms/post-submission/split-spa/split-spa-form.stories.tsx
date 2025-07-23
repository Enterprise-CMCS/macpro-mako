import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { SplitSpaForm } from "./index";

const meta = {
  title: "Form/SplitSpa",
  component: SplitSpaForm,
  decorators: [withRouter],
} satisfies Meta<typeof SplitSpaForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { id: "42", authority: "Medicaid SPA" },
      },
      routing: {
        path: "/test/:id/:authority",
        handle: "Split Spa",
      },
    }),
  },
};
