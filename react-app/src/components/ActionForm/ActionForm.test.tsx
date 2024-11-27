import { fireEvent, waitFor, waitForElementToBeRemoved, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, afterEach } from "vitest";
import { ActionForm } from "./index";
import { z } from "zod";
import { attachmentArraySchemaOptional, SEATOOL_STATUS } from "shared-types";
import { ERROR_ITEM_ID, setMockUsername, useDefaultStateSubmitter } from "mocks";
import * as userPrompt from "@/components/ConfirmationDialog/userPrompt";
import * as banner from "@/components/Banner/banner";
import * as documentPoller from "@/utils/Poller/documentPoller";
import { EXISTING_ITEM_PENDING_ID } from "mocks";
import { renderForm, renderFormWithPackageSection } from "@/utils/test-helpers/renderForm";
import { isCmsReadonlyUser } from "shared-utils";

const PROGRESS_REMINDER = /If you leave this page, you will lose your progress on this form./;

describe("ActionForm", () => {
  test("renders `breadcrumbText`", async () => {
    const { queryByText } = renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({})}
        fields={() => null}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        breadcrumbText="Example Breadcrumb"
      />,
    );
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

    expect(queryByText("Example Breadcrumb")).toBeInTheDocument();
  });

  test("renders `title`", async () => {
    const { queryByText } = renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({})}
        fields={() => null}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        breadcrumbText="Example Breadcrumb"
      />,
    );
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

    expect(queryByText("Action Form Title")).toBeInTheDocument();
  });

  test("renders `attachments.faqLink`", async () => {
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
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

    expect(queryByText("FAQ Page")).toHaveAttribute("href", "/hello-world-link");
  });

  test("renders `attachments.title`", async () => {
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
        attachments={{ title: "this is an attachments title" }}
        breadcrumbText="Example Breadcrumb"
      />,
    );
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

    expect(queryByText("this is an attachments title")).toBeInTheDocument();
  });

  test("doesn't render form if user access is denied", async () => {
    setMockUsername(null);

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
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

    expect(queryByText("Action Form Title")).not.toBeInTheDocument();
    useDefaultStateSubmitter();
  });

  test("renders `defaultValues` in appropriate input", async () => {
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
        defaultValues={{ id: "default value for id" }}
        breadcrumbText="Example Breadcrumb"
      />,
    );
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

    expect(queryByDisplayValue("default value for id")).toBeInTheDocument();
  });

  test("renders `attachments.instructions`", async () => {
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
          instructions: [<>hello world special instructions.</>],
        }}
        breadcrumbText="Example Breadcrumb"
      />,
    );
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

    expect(queryByText(/hello world special instructions./)).toBeInTheDocument();
  });

  test("renders `attachments.callout`", async () => {
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
          callout: "this is a callout",
        }}
        breadcrumbText="Example Breadcrumb"
      />,
    );
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

    expect(queryByText(/this is a callout/)).toBeInTheDocument();
  });
  //
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
        promptOnLeavingForm={{
          header: "Hello World Header",
          body: "Hello World Body",
        }}
        breadcrumbText="Example Breadcrumb"
      />,
    );
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

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
  //
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
        defaultValues={{ id: "hello world" }}
        promptPreSubmission={{
          header: "Hello World Header",
          body: "Hello World Body",
        }}
        breadcrumbText="Example Breadcrumb"
      />,
    );
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

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
    const documentPollerSpy = vi.spyOn(documentPoller, "documentPoller");

    renderFormWithPackageSection(
      <ActionForm
        title="Action Form Title"
        schema={z.object({
          id: z.string(),
        })}
        defaultValues={{ id: EXISTING_ITEM_PENDING_ID }}
        fields={() => null}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: (checker) => checker.hasStatus(SEATOOL_STATUS.PENDING),
        }}
        breadcrumbText="Example Breadcrumb"
      />,
      EXISTING_ITEM_PENDING_ID,
      "Medicaid SPA",
    );
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

    fireEvent.submit(await screen.findByTestId("submit-action-form"));

    expect(documentPollerSpy).toHaveBeenCalledWith("id", EXISTING_ITEM_PENDING_ID);
  });

  test("calls `banner` with `bannerPostSubmission`", async () => {
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
          documentChecker: () => true,
        }}
        bannerPostSubmission={{
          header: "Hello World Header",
          body: "Hello World Body",
        }}
        breadcrumbText="Example Breadcrumb"
      />,
    );
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

    const bannerPollerSpy = vi.spyOn(banner, "banner");

    const form = container.querySelector("form");
    fireEvent.submit(form);

    await waitFor(() =>
      expect(bannerPollerSpy).toBeCalledWith({
        header: "Hello World Header",
        body: "Hello World Body",
        pathnameToDisplayOn: "/dashboard",
      }),
    );
  });

  test("calls error banner if submission fails", async () => {
    const { container } = renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({
          id: z.string(),
        })}
        defaultValues={{ id: ERROR_ITEM_ID }}
        fields={() => null}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        breadcrumbText="Example Breadcrumb"
      />,
    );
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

    const bannerPollerSpy = vi.spyOn(banner, "banner");

    const form = container.querySelector("form");
    fireEvent.submit(form);

    await waitFor(() =>
      expect(bannerPollerSpy).toBeCalledWith({
        header: "An unexpected error has occurred:",
        body: "Intentional failure",
        pathnameToDisplayOn: "/",
        variant: "destructive",
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
        breadcrumbText="Example Breadcrumb"
      />,
    );
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

    const otherAttachmentLabels = queryAllByText("Other");

    expect(otherAttachmentLabels.length).toBe(3);
  });

  test("renders Additional Information if `additionalInformation` is defined in schema", async () => {
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
        breadcrumbText="Example Breadcrumb"
      />,
    );
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

    expect(queryByText("Additional Information")).toBeInTheDocument();
  });

  test("doesn't render Additional Information if `additionalInformation` is undefined in schema", async () => {
    const { queryByText } = renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({})}
        fields={() => null}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        additionalInformation={false}
        breadcrumbText="Example Breadcrumb"
      />,
    );
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

    expect(queryByText("Additional Information")).not.toBeInTheDocument();
  });

  test("renders Attachments if `attachments` is defined in schema", async () => {
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
        breadcrumbText="Example Breadcrumb"
      />,
    );
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

    expect(queryByText("Attachments")).toBeInTheDocument();
    expect(queryByText("Other")).toBeInTheDocument();
  });

  test("doesn't render Attachments if `attachments` is undefined in schema", async () => {
    const { queryByText } = renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({})}
        fields={() => null}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        breadcrumbText="Example Breadcrumb"
      />,
    );
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

    expect(queryByText("Attachments")).not.toBeInTheDocument();
  });

  test("renders ProgressReminder if schema has `attachments` property", async () => {
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
        breadcrumbText="Example Breadcrumb"
      />,
    );
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

    expect(queryAllByText(PROGRESS_REMINDER).length).toBe(2);
  });

  test("renders ProgressReminder if `areFieldsRequired` property is undefined", async () => {
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
        breadcrumbText="Example Breadcrumb"
      />,
    );
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

    expect(queryAllByText(PROGRESS_REMINDER).length).toBe(2);
  });

  test("doesn't render ProgressReminder if `areFieldsRequired` is false", () => {
    const { queryByText } = renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({})}
        fields={() => null}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        breadcrumbText="Example Breadcrumb"
        areFieldsRequired={false}
      />,
    );

    expect(queryByText(PROGRESS_REMINDER)).not.toBeInTheDocument();
  });

  test("renders default wrapper if `fieldsLayout` is undefined", async () => {
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
        breadcrumbText="Example Breadcrumb"
      />,
    );
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

    expect(
      queryAllByText(/Once you submit this form, a confirmation email is sent to you and to CMS./)
        .length,
    ).toBe(2);
  });
});
