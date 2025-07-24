import type { Meta, StoryObj } from "@storybook/react-vite";
import { TEST_STATE_SUBMITTER_USERNAME } from "mocks";

import { withQueryClientAndMemoryRouter } from "../../../../../.storybook/decorators";
import { SplitSpaForm } from "./index";

const meta = {
  title: "Form/SplitSpa",
  component: SplitSpaForm,
  decorators: [withQueryClientAndMemoryRouter],
  parameters: {
    routes: [
      {
        path: "/",
        element: <h1>home</h1>,
      },
      {
        path: "/dashboard",
        element: <h1>dashboard test</h1>,
      },
      {
        path: "/test/:id/:authority",
        element: <SplitSpaForm />,
      },
    ],
    routeOptions: {
      initialEntries: ["/test/42/Medicaid SPA"],
    },
    username: TEST_STATE_SUBMITTER_USERNAME,
  },
} satisfies Meta<typeof SplitSpaForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
