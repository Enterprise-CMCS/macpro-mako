import type { Meta, StoryObj } from "@storybook/react-vite";
import { add, sub } from "date-fns";
import { fn } from "storybook/test";

import { FilterableDateRange } from "./DateRange";

const meta = {
  title: "Component/Filter/DateRange",
  component: FilterableDateRange,
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof FilterableDateRange>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    value: {},
  },
};

export const WithFromDate: Story = {
  args: {
    value: { gte: sub(new Date(), { days: 7 }).toISOString() },
  },
};

export const WithToDate: Story = {
  args: {
    value: { lte: add(new Date(), { days: 7 }).toISOString() },
  },
};

export const WithFromToDates: Story = {
  args: {
    value: {
      gte: sub(new Date(), { days: 7 }).toISOString(),
      lte: add(new Date(), { days: 7 }).toISOString(),
    },
  },
};
