import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { CHIPEligibilityLandingPage } from "./ExternalAppLandingPage";

const meta = {
  title: "Form/NewSubmission/SPA/CHIP/Landing/CHIP Eligibility",
  component: CHIPEligibilityLandingPage,
  decorators: [withRouter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/new-submission/spa/chip/landing/chip-eligibility",
      },
    }),
  },
} satisfies Meta<typeof CHIPEligibilityLandingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
