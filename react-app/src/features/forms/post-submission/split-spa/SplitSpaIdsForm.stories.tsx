import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormProvider, useForm } from "react-hook-form";

import { SplitSpaIdsForm } from "./SplitSpaIdsForm";

const FormWrapper = ({ splitCount, spaId }) => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <form>
        <SplitSpaIdsForm control={methods.control} splitCount={splitCount} spaId={spaId} />
      </form>
    </FormProvider>
  );
};

const meta = {
  title: "Form/SplitSpa/SplitSpaIds",
  component: SplitSpaIdsForm,
  render: FormWrapper,
  argTypes: {
    control: { control: false },
    splitCount: {
      control: { type: "select" },
      options: [2, 3, 4, 5, 6, 7, 8],
    },
  },
} satisfies Meta<typeof SplitSpaIdsForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // @ts-ignore
  args: {
    spaId: "NY-23-0007",
    splitCount: 3,
  },
};
