import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { FilterableSelect } from "./Select";

const meta = {
  title: "Component/Filtering/Filterable Select",
  component: FilterableSelect,
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof FilterableSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unselected: Story = {
  args: {
    ariaLabel: "Select an option",
    options: [
      { label: "Apple", value: "apple" },
      { label: "Banana", value: "banana" },
      { label: "Carrot", value: "carrot" },
      { label: "Date", value: "date" },
      { label: "Eggplant", value: "eggplant" },
      { label: "Fennel", value: "fennel" },
      { label: "Grapes", value: "grapes" },
      { label: "Honey", value: "honey" },
    ],
    placeholder: "Select option here",
    selectedDisplay: "label",
    value: [],
  },
};

export const SelectedDisplayLabel: Story = {
  args: {
    ariaLabel: "Select an option",
    options: [
      { label: "Apple", value: "apple" },
      { label: "Banana", value: "banana" },
      { label: "Carrot", value: "carrot" },
      { label: "Date", value: "date" },
      { label: "Eggplant", value: "eggplant" },
      { label: "Fennel", value: "fennel" },
      { label: "Grapes", value: "grapes" },
      { label: "Honey", value: "honey" },
    ],
    placeholder: "Select option here",
    selectedDisplay: "label",
    value: ["carrot", "grapes"],
  },
};

export const SelectedDisplayValue: Story = {
  args: {
    ariaLabel: "Select an option",
    options: [
      { label: "Apple", value: "apple" },
      { label: "Banana", value: "banana" },
      { label: "Carrot", value: "carrot" },
      { label: "Date", value: "date" },
      { label: "Eggplant", value: "eggplant" },
      { label: "Fennel", value: "fennel" },
      { label: "Grapes", value: "grapes" },
      { label: "Honey", value: "honey" },
    ],
    placeholder: "Select option here",
    selectedDisplay: "value",
    value: ["date", "fennel"],
  },
};
