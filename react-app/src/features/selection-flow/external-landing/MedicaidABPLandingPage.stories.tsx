import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { MedicaidABPLandingPage } from "./ExternalAppLandingPage";

const meta = {
  title: "Form/NewSubmission/SPA/Medicaid/Landing/Medicaid ABP",
  component: MedicaidABPLandingPage,
  decorators: [withRouter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/new-submission/spa/medicaid/landing/medicaid-abp",
      },
    }),
  },
} satisfies Meta<typeof MedicaidABPLandingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
