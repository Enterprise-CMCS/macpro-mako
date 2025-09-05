//MedicaidForm

import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";

import { asStateSubmitter } from "../../../../.storybook/decorators";
import { MedicaidForm } from "./Medicaid";

const meta = {
  title: "Form/NewSubmission/SPA/Medicaid/Create",
  component: MedicaidForm,
  decorators: [withRouter, asStateSubmitter],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: {
        path: "/new-submission/spa/medicaid/create",
      },
    }),
  },
} satisfies Meta<typeof MedicaidForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
