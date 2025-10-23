import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { SignUp } from "./sign-up";

const meta = {
  title: "Feature/Sign Up",
  component: SignUp,
  decorators: [withRouter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/signup",
      },
    }),
  },
} satisfies Meta<typeof SignUp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
