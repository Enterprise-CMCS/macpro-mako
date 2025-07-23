import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { SplitSpaId } from "./split-spa-id";

const meta = {
  title: "Component/SplitSpa",
  component: SplitSpaId,
  args: { onValueChange: fn() },
} satisfies Meta<typeof SplitSpaId>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BaseSpa: Story = {
  args: {
    spaId: "NY-23-0007",
  },
};

export const SpaA: Story = {
  args: {
    spaId: "NY-23-0007",
    suffix: "A",
  },
};
