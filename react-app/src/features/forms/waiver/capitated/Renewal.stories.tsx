import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asStateSubmitter } from "../../../../../.storybook/decorators";
import { Renewal } from "./Renewal";

const meta = {
  title: "Form/NewSubmission/Waiver/B/Capitated/Renewal/Create",
  component: Renewal,
  decorators: [withRouter, asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/new-submission/waiver/b/capitated/renewal/create",
      },
    }),
  },
} satisfies Meta<typeof Renewal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
