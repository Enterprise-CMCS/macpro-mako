import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

const FormWrapper = ({ options, value }) => {
  const methods = useForm({
    defaultValues: {
      example: value,
    },
  });
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  return (
    <FormProvider {...methods}>
      <form>
        <FormField
          control={methods.control}
          name="example"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">Example</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                }}
                value={field.value}
                open={isSelectOpen}
                onOpenChange={setIsSelectOpen}
              >
                <FormControl>
                  <SelectTrigger data-testid="example-select">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.id} value={option.value}>
                      <div className="flex items-start gap-x-2">
                        <strong className="w-16 flex-shrink-0 text-left">{option.value}</strong>
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </FormProvider>
  );
};

const meta = {
  title: "Component/Inputs/Select",
  component: Select,
  render: FormWrapper,
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unselected: Story = {
  args: {
    options: [
      { id: 1, value: "first", label: "First Choice" },
      { id: 2, value: "second", label: "Second Choice" },
      { id: 3, value: "third", label: "Third Choice" },
    ],
    value: undefined,
  },
};

export const Selected: Story = {
  args: {
    options: [
      { id: 1, value: "first", label: "First Choice" },
      { id: 2, value: "second", label: "Second Choice" },
      { id: 3, value: "third", label: "Third Choice" },
    ],
    value: "second",
  },
};