import type { Meta, StoryObj } from "@storybook/react-vite";
import { TEST_STATE_SUBMITTER_USERNAME } from "mocks";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";
import { z } from "zod";

import { ActionForm } from "./index";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  RequiredIndicator,
} from "@/components";

const meta = {
  title: "Form/ActionForm",
  component: ActionForm,
  decorators: [withRouter],
  argTypes: {
    schema: {
      control: false,
    },
  },
  parameters: {
    reactRouter: reactRouterParameters({
      location: {
        pathParams: { id: "NY-23-0007", authority: "Medicaid SPA" },
      },
      routing: {
        path: "/test/:id/:authority",
      },
    }),
    username: TEST_STATE_SUBMITTER_USERNAME,
  },
} satisfies Meta<typeof ActionForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    schema: z.object({
      id: z.string(),
    }),
    title: "Test Form",
    breadcrumbText: "Test",
    fields: ({ control }) => (
      <FormField
        control={control}
        name="id"
        render={({ field }) => (
          <FormItem>
            <div className="flex gap-4">
              <FormLabel className="font-semibold" data-testid="spaid-label">
                SPA ID <RequiredIndicator />
              </FormLabel>
            </div>
            <FormControl>
              <Input
                className="max-w-sm"
                ref={field.ref}
                value={field.value}
                onChange={(e) => field.onChange(e.currentTarget.value.toUpperCase())}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    documentPollerArgs: {
      property: "id",
      documentChecker: (check) => check.recordExists,
    },
  },
};
