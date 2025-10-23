import type { Meta, StoryObj } from "@storybook/react-vite";
import { reactRouterParameters, withRouter } from "storybook-addon-remix-react-router";
import { z } from "zod";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  RequiredIndicator,
} from "@/components";

import { asStateSubmitter } from "../../../.storybook/decorators";
import { ActionForm } from "./index";

const meta = {
  title: "Form/ActionForm",
  component: ActionForm,
  decorators: [withRouter, asStateSubmitter],
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
  },
} satisfies Meta<typeof ActionForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
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
