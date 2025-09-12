import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormProvider, useForm } from "react-hook-form";
import { DatePickerProps } from "shared-types";
import { fn } from "storybook/test";

import { DatePicker } from "./date-picker";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./form";

const FormWrapper = ({ date, dataTestId }: Partial<DatePickerProps>) => {
  const methods = useForm({
    defaultValues: {
      exampleDate: date,
    },
  });
  return (
    <FormProvider {...methods}>
      <form>
        <FormField
          control={methods.control}
          name="exampleDate"
          render={({ field }) => (
            <FormItem className="max-w-sm">
              <FormLabel className="text-lg font-semibold whitespace-nowrap block">
                Example Date
              </FormLabel>
              <FormControl>
                <DatePicker dataTestId={dataTestId} onChange={field.onChange} date={field.value} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </FormProvider>
  );
};

const meta = {
  title: "Component/Inputs/DatePicker",
  component: DatePicker,
  render: FormWrapper,
  argTypes: {
    date: { control: "date" },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    date: undefined,
    onChange: fn(),
  },
};

export const WithDate: Story = {
  args: {
    date: new Date(),
    onChange: fn(),
  },
};
