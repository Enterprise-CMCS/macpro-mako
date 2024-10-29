import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import { ActionForm } from "./index";
import { z } from "zod";
import { attachmentArraySchemaOptional } from "shared-types";
import * as userPrompt from "@/components/ConfirmationDialog/userPrompt";
import * as banner from "@/components/Banner/banner";
import * as documentPoller from "@/utils/Poller/documentPoller";
import { renderForm } from "@/utils/test-helpers/renderForm";
import { isCmsReadonlyUser } from "shared-utils";

vi.mock("aws-amplify", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    API: {
      post: vi.fn(),
    },
  };
});

vi.mock("../../utils/Poller/DataPoller", () => {
  return {
    DataPoller: vi.fn().mockImplementation(() => ({
      startPollingData: vi.fn(() => Promise.resolve()),
    })),
  };
});

const PROGRESS_REMINDER =
  /If you leave this page, you will lose your progress on this form./;

describe("ActionForm", () => {
  test("renders `breadcrumbText`", () => {
    const { queryByText } = renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({})}
        fields={() => null}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        attachments={{ faqLink: "" }}
        breadcrumbText="Example Breadcrumb"
      />,
    );

    expect(queryByText("Example Breadcrumb")).toBeInTheDocument();
  });

  test("renders `title`", () => {
    const { queryByText } = renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({})}
        fields={() => null}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        attachments={{ faqLink: "" }}
        breadcrumbText="Example Breadcrumb"
      />,
    );

    expect(queryByText("Action Form Title")).toBeInTheDocument();
  });

  test("renders `attachments.faqLink`", () => {
    const { queryByText } = renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({
          attachments: z.object({
            other: z.object({
              label: z.string().default("Other"),
              files: attachmentArraySchemaOptional(),
            }),
          }),
        })}
        fields={() => null}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        attachments={{ faqLink: "hello-world-link" }}
        breadcrumbText="Example Breadcrumb"
      />,
    );

    expect(queryByText("FAQ Page")).toHaveAttribute(
      "href",
      "/hello-world-link",
    );
  });

  test("doesn't render form if user access is denied", () => {
    const { queryByText } = renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({
          attachments: z.object({
            other: z.object({
              label: z.string().default("Other"),
              files: attachmentArraySchemaOptional(),
            }),
          }),
        })}
        fields={() => null}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        attachments={{ faqLink: "hello-world-link" }}
        conditionsDeterminingUserAccess={[isCmsReadonlyUser]}
        breadcrumbText="Example Breadcrumb"
      />,
    );

    expect(queryByText("Action Form Title")).not.toBeInTheDocument();
  });

  test("renders `defaultValues` in appropriate input", () => {
    const { queryByDisplayValue } = renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({
          id: z.string(),
        })}
        fields={({ control }) => <input {...control.register("id")} />}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        attachments={{ faqLink: "" }}
        defaultValues={{ id: "default value for id" }}
        breadcrumbText="Example Breadcrumb"
      />,
    );

    expect(queryByDisplayValue("default value for id")).toBeInTheDocument();
  });

  test("renders `attachments.instructions`", () => {
    const { queryByText } = renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({
          attachments: z.object({
            other: z.object({
              files: attachmentArraySchemaOptional(),
              label: z.string().default("Other"),
            }),
          }),
        })}
        fields={() => null}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        attachments={{
          faqLink: "",
          instructions: "hello world special instructions.",
        }}
        breadcrumbText="Example Breadcrumb"
      />,
    );

    expect(
      queryByText(/hello world special instructions./),
    ).toBeInTheDocument();
  });

  test("renders custom `promptOnLeavingForm` when clicking Cancel", async () => {
    const { container } = renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({})}
        fields={() => null}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        attachments={{
          faqLink: "",
        }}
        promptOnLeavingForm={{
          header: "Hello World Header",
          body: "Hello World Body",
        }}
        breadcrumbText="Example Breadcrumb"
      />,
    );

    const onAcceptMock = vi.fn();
    const userPromptSpy = vi
      .spyOn(userPrompt, "userPrompt")
      .mockImplementation((args) => (args.onAccept = onAcceptMock));

    const cancelBtn = container.querySelector('button[type="reset"]');
    await userEvent.click(cancelBtn);

    expect(userPromptSpy).toBeCalledWith({
      header: "Hello World Header",
      body: "Hello World Body",
      onAccept: onAcceptMock,
    });
  });

  test("renders custom `promptPreSubmission` when clicking Submit", async () => {
    const { container } = renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({
          id: z.string(),
        })}
        fields={() => null}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        attachments={{
          faqLink: "",
        }}
        defaultValues={{ id: "hello world" }}
        promptPreSubmission={{
          header: "Hello World Header",
          body: "Hello World Body",
        }}
        breadcrumbText="Example Breadcrumb"
      />,
    );

    const onAcceptMock = vi.fn();
    const userPromptSpy = vi
      .spyOn(userPrompt, "userPrompt")
      .mockImplementation((args) => (args.onAccept = onAcceptMock));

    const submitBtn = container.querySelector('button[type="button"]');
    await userEvent.click(submitBtn);

    expect(userPromptSpy).toBeCalledWith({
      header: "Hello World Header",
      body: "Hello World Body",
      onAccept: onAcceptMock,
    });
  });

  test("calls `documentPoller` with `documentPollerArgs`", async () => {
    const documentCheckerFunc = vi.fn();

    const { container } = renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({
          id: z.string(),
        })}
        defaultValues={{ id: "Example Breadcrumb" }}
        fields={() => null}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: documentCheckerFunc,
        }}
        attachments={{
          faqLink: "",
        }}
        breadcrumbText="Example Breadcrumb"
      />,
    );

    const documentPollerSpy = vi
      .spyOn(documentPoller, "documentPoller")
      .mockImplementationOnce(vi.fn());

    const submitBtn = container.querySelector('button[type="submit"]');
    await userEvent.click(submitBtn);

    waitFor(() =>
      expect(documentPollerSpy).toBeCalledWith("id", documentCheckerFunc),
    );
  });

  test("calls `banner` with `bannerPostSubmission`", async () => {
    const documentCheckerFunc = vi.fn();

    const { container } = renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({
          id: z.string(),
        })}
        defaultValues={{ id: "Example Breadcrumb" }}
        fields={() => null}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: documentCheckerFunc,
        }}
        bannerPostSubmission={{
          header: "Hello World Header",
          body: "Hello World Body",
        }}
        attachments={{
          faqLink: "",
        }}
        breadcrumbText="Example Breadcrumb"
      />,
    );

    const bannerPollerSpy = vi.spyOn(banner, "banner");

    const submitBtn = container.querySelector('button[type="submit"]');
    await userEvent.click(submitBtn);

    waitFor(() =>
      expect(bannerPollerSpy).toBeCalledWith({
        header: "Hello World Header",
        body: "Hello World Body",
        pathnameToDisplayOn: "/dashboard",
      }),
    );
  });

  test("renders all attachment properties within `attachments`", async () => {
    const { queryAllByText } = renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({
          attachments: z.object({
            other1: z.object({
              files: attachmentArraySchemaOptional(),
              label: z.string().default("Other"),
            }),
            other2: z.object({
              files: attachmentArraySchemaOptional(),
              label: z.string().default("Other"),
            }),
            other3: z.object({
              files: attachmentArraySchemaOptional(),
              label: z.string().default("Other"),
            }),
          }),
        })}
        fields={() => null}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        attachments={{
          faqLink: "",
        }}
        breadcrumbText="Example Breadcrumb"
      />,
    );

    const otherAttachmentLabels = queryAllByText("Other");

    expect(otherAttachmentLabels.length).toBe(3);
  });

  test("renders Additional Information if `additionalInformation` is defined in schema", () => {
    const { queryByText } = renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({
          additionalInformation: z.string().max(4000).nullable().default(null),
        })}
        fields={() => null}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        attachments={{ faqLink: "" }}
        breadcrumbText="Example Breadcrumb"
      />,
    );

    expect(queryByText("Additional Information")).toBeInTheDocument();
  });

  test("doesn't render Additional Information if `additionalInformation` is undefined in schema", () => {
    const { queryByText } = renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({})}
        fields={() => null}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        attachments={{ faqLink: "" }}
        breadcrumbText="Example Breadcrumb"
      />,
    );

    expect(queryByText("Additional Information")).not.toBeInTheDocument();
  });

  test("renders Attachments if `attachments` is defined in schema", () => {
    const { queryByText } = renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({
          attachments: z.object({
            other: z.object({
              files: attachmentArraySchemaOptional(),
              label: z.string().default("Other"),
            }),
          }),
        })}
        fields={() => null}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        attachments={{ faqLink: "" }}
        breadcrumbText="Example Breadcrumb"
      />,
    );

    expect(queryByText("Attachments")).toBeInTheDocument();
    expect(queryByText("Other")).toBeInTheDocument();
  });

  test("doesn't render Attachments if `attachments` is undefined in schema", () => {
    const { queryByText } = renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({})}
        fields={() => null}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        attachments={{ faqLink: "" }}
        breadcrumbText="Example Breadcrumb"
      />,
    );

    expect(queryByText("Attachments")).not.toBeInTheDocument();
  });

  test("renders ProgressReminder if schema has `attachments` property", () => {
    const { queryAllByText } = renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({
          attachments: z.object({
            other: z.object({
              files: attachmentArraySchemaOptional(),
              label: z.string().default("Other"),
            }),
          }),
        })}
        fields={() => null}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        attachments={{ faqLink: "" }}
        breadcrumbText="Example Breadcrumb"
      />,
    );

    expect(queryAllByText(PROGRESS_REMINDER).length).toBe(2);
  });

  test("renders ProgressReminder if `fields` property is defined", () => {
    const { queryAllByText } = renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({})}
        fields={() => (
          <>
            <div />
            <div />
          </>
        )}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        attachments={{ faqLink: "" }}
        breadcrumbText="Example Breadcrumb"
      />,
    );

    expect(queryAllByText(PROGRESS_REMINDER).length).toBe(2);
  });

  test("doesn't render ProgressReminder `fields` is undefined and `attachments` isn't defined in schema", () => {
    const { queryByText } = renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({})}
        fields={() => null}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        attachments={{ faqLink: "" }}
        breadcrumbText="Example Breadcrumb"
      />,
    );

    expect(queryByText(PROGRESS_REMINDER)).not.toBeInTheDocument();
  });

  test("renders default wrapper if `fieldsLayout` is undefined", () => {
    const { queryAllByText } = renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({})}
        fields={() => (
          <>
            <div />
            <div />
          </>
        )}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        attachments={{ faqLink: "" }}
        breadcrumbText="Example Breadcrumb"
      />,
    );

    expect(
      queryAllByText(
        /Once you submit this form, a confirmation email is sent to you and to CMS./,
      ).length,
    ).toBe(2);
  });

  test("renders `fieldsLayout`", () => {
    const { queryByText } = renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({})}
        fieldsLayout={({ children }) => (
          <>
            hello world!
            {children}
          </>
        )}
        fields={() => <p>hello world within fields Layout</p>}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        attachments={{ faqLink: "" }}
        breadcrumbText="Example Breadcrumb"
      />,
    );

    expect(queryByText("Example Breadcrumb")).toBeInTheDocument();
    expect(queryByText("hello world within fields Layout")).toBeInTheDocument();
  });

  test("renders `fieldsLayout` with correct `title`", () => {
    const { queryByText } = renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({})}
        fieldsLayout={({ children, title }) => (
          <>
            {title}
            {children}
          </>
        )}
        fields={() => <p>hello world within fields Layout</p>}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        attachments={{ faqLink: "" }}
        breadcrumbText="Example Breadcrumb"
      />,
    );

    expect(queryByText("Action Form Title")).toBeInTheDocument();
    expect(queryByText("hello world within fields Layout")).toBeInTheDocument();
  });
});
