import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asCmsReviewer } from "../../../../../.storybook/decorators";
import { SplitSpaForm } from "./index";

const meta = {
  title: "Form/SplitSpa",
  component: SplitSpaForm,
  render: () => <SplitSpaForm />,
  decorators: [withRouter, asCmsReviewer],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { id: "NY-23-0007", authority: "Medicaid SPA" },
      },
      routing: {
        path: "/test/:id/:authority",
      },
    }),
  },
} satisfies Meta<typeof SplitSpaForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
