import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { CMSSignup } from "./cmsSignup";

const meta = {
  title: "Feature/CMS Sign Up",
  component: CMSSignup,
  decorators: [withRouter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/signup/cms",
      },
    }),
  },
} satisfies Meta<typeof CMSSignup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
