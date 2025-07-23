import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { EditableText } from "./editable-text";

const meta = {
  title: "Component/EditableText",
  component: EditableText,
  args: { onValueChange: fn() },
} satisfies Meta<typeof EditableText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
  args: {
    value: "Testing",
  },
};
