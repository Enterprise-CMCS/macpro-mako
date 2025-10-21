import type { Meta, StoryObj } from "@storybook/react-vite";

import { ABPGuide } from "./index";

const meta = {
  title: "Webforms/ABP Guide",
  component: ABPGuide,
} satisfies Meta<typeof ABPGuide>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
