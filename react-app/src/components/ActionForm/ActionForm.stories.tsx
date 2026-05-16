import type { Meta, StoryObj } from "@storybook/react-vite";
import { API_ENDPOINT, defaultApiHandlers, http, HttpResponse } from "mocks";
import { expect, userEvent, waitFor, within } from "storybook/test";
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

import { asStateSubmitter, updateFlags } from "../../../.storybook/decorators";
import { DRAFT_ID_CONFLICT_MESSAGE } from "../../utils/drafts";
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

const schema = z.object({
  id: z.string(),
});

const fields: NonNullable<Story["args"]>["fields"] = ({ control }) => (
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
);

const baseArgs: Story["args"] = {
  schema,
  title: "Test Form",
  breadcrumbText: "Test",
  fields,
  documentPollerArgs: {
    property: "id" as const,
    documentChecker: (check) => check.recordExists,
  },
};

export const Basic: Story = {
  args: baseArgs,
};

export const DraftEnabled: Story = {
  args: {
    ...baseArgs,
    title: "Draft Enabled Form",
    defaultValues: {
      id: "MD-26-0001-P",
    },
    draftOptions: {
      enabled: true,
      event: "new-medicaid-submission",
    },
  },
};

export const DraftWithStickyFooter: Story = {
  args: {
    ...DraftEnabled.args,
  },
  parameters: {
    msw: {
      handlers: {
        flags: updateFlags({ "sticky-form-footer": true }),
      },
    },
  },
};

export const DraftWithoutStickyFooter: Story = {
  args: {
    ...DraftEnabled.args,
  },
  parameters: {
    msw: {
      handlers: {
        flags: updateFlags({ "sticky-form-footer": false }),
      },
    },
  },
};

export const DraftIdConflict: Story = {
  args: {
    ...DraftEnabled.args,
  },
  parameters: {
    msw: {
      handlers: {
        api: [
          http.post(`${API_ENDPOINT}/itemExists`, async () => HttpResponse.json({ exists: true })),
          ...defaultApiHandlers,
        ],
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByTestId("save-draft-form"));

    await waitFor(() => {
      expect(canvas.getByTestId("draft-save-status")).toHaveTextContent(DRAFT_ID_CONFLICT_MESSAGE);
    });
  },
};
