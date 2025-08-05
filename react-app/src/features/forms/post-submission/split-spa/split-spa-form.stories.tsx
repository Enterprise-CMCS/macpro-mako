import type { Meta, StoryObj } from "@storybook/react-vite";
import { TEST_REVIEWER_USERNAME } from "mocks";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { SplitSpaForm } from "./index";

const meta = {
  title: "Form/SplitSpa",
  component: SplitSpaForm,
  render: () => <SplitSpaForm />,
  decorators: [withRouter],
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { id: "NY-23-0007", authority: "Medicaid SPA" },
      },
      routing: {
        path: "/test/:id/:authority",
      },
    }),
    username: TEST_REVIEWER_USERNAME,
  },
} satisfies Meta<typeof SplitSpaForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
