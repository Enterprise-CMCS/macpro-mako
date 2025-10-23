import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { MedicaidEligibilityLandingPage } from "./ExternalAppLandingPage";

const meta = {
  title: "Form/NewSubmission/SPA/Medicaid/Landing/Medicaid Eligibility",
  component: MedicaidEligibilityLandingPage,
  decorators: [withRouter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/new-submission/spa/medicaid/landing/medicaid-eligibility",
      },
    }),
  },
} satisfies Meta<typeof MedicaidEligibilityLandingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
