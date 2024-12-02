import { fireEvent, waitFor, waitForElementToBeRemoved, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import { ActionForm } from "./index";
import { z } from "zod";
import { attachmentArraySchemaOptional, SEATOOL_STATUS } from "shared-types";
import {
  SUBMISSION_ERROR_ITEM_ID,
  GET_ERROR_ITEM_ID,
  setMockUsername,
  useDefaultStateSubmitter,
} from "mocks";
import * as userPrompt from "@/components/ConfirmationDialog/userPrompt";
import * as banner from "@/components/Banner/banner";
import * as documentPoller from "@/utils/Poller/documentPoller";
import { DataPoller } from "@/utils/Poller/DataPoller";
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
    renderForm(
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

    expect(screen.queryByText("Action Form Title")).toBeInTheDocument();
  });

  test("renders `attachments.faqLink`", async () => {
    renderForm(
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

    expect(screen.queryByText("FAQ Page")).toHaveAttribute("href", "/hello-world-link");
  });

  test("renders `attachments.title`", async () => {
    renderForm(
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

    expect(screen.queryByText("this is an attachments title")).toBeInTheDocument();
  });

  test("doesn't render form if user access is denied", async () => {
    setMockUsername(null);

    renderForm(
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

    expect(screen.queryByText("Action Form Title")).not.toBeInTheDocument();
    useDefaultStateSubmitter();
  });

  test("renders `defaultValues` in appropriate input", async () => {
    renderForm(
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

    expect(screen.queryByDisplayValue("default value for id")).toBeInTheDocument();
  });

  test("renders `attachments.instructions`", async () => {
    renderForm(
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

    expect(screen.queryByText(/hello world special instructions./)).toBeInTheDocument();
  });

  test("renders `attachments.callout`", async () => {
    renderForm(
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

    expect(screen.queryByText(/this is a callout/)).toBeInTheDocument();
  });

  test("renders custom `promptOnLeavingForm` when clicking Cancel", async () => {
    renderForm(
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

    const cancelBtn = await screen.findByTestId("cancel-action-form");
    await userEvent.click(cancelBtn);

    expect(userPromptSpy).toBeCalledWith({
      header: "Hello World Header",
      body: "Hello World Body",
      onAccept: onAcceptMock,
    });
  });
  //
  test("renders custom `promptPreSubmission` when clicking Submit", async () => {
    renderForm(
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

    const submitBtn = await screen.findByTestId("submit-action-form");
    await userEvent.click(submitBtn);

    expect(userPromptSpy).toBeCalledWith({
      header: "Hello World Header",
      body: "Hello World Body",
      onAccept: onAcceptMock,
    });
  });

  test("calls `documentPoller` with `documentPollerArgs`", async () => {
    const documentPollerSpy = vi.spyOn(documentPoller, "documentPoller");
    const documentChecker: documentPoller.CheckDocumentFunction = (checker) =>
      checker.hasStatus(SEATOOL_STATUS.PENDING);

    renderForm(
      <ActionForm
        title="Action Form Title"
        schema={z.object({
          id: z.string(),
          status: z.string(),
        })}
        defaultValues={{ id: EXISTING_ITEM_PENDING_ID, status: SEATOOL_STATUS.PENDING }}
        fields={() => null}
        documentPollerArgs={{
          property: "id",
          documentChecker,
        }}
        breadcrumbText="Example Breadcrumb"
      />,
    );
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

    fireEvent.submit(await screen.findByTestId("submit-action-form"));

    await waitFor(() =>
      expect(documentPollerSpy).toHaveBeenCalledWith(EXISTING_ITEM_PENDING_ID, documentChecker),
    );
  });

  test("calls `banner` with `bannerPostSubmission`", async () => {
    const dataPollerSpy = vi.spyOn(DataPoller.prototype, "startPollingData");
    const bannerSpy = vi.spyOn(banner, "banner");

    renderFormWithPackageSection(
      <ActionForm
        title="Action Form Title"
        schema={z.object({
          id: z.string(),
        })}
        defaultValues={{ id: EXISTING_ITEM_PENDING_ID }}
        fields={() => null}
        documentPollerArgs={{
          property: "id",
          documentChecker: () => true,
        }}
        bannerPostSubmission={{
          header: "Hello World Header",
          body: "Hello World Body",
        }}
        breadcrumbText="Example Breadcrumb"
      />,
      EXISTING_ITEM_PENDING_ID,
      "Medicaid SPA",
    );
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

    const submitButton = await screen.findByTestId("submit-action-form");

    vi.useFakeTimers();

    fireEvent.submit(submitButton);

    await vi.waitFor(async () => {
      await vi.runAllTimersAsync();
      expect(dataPollerSpy).toHaveResolvedWith({
        correctDataStateFound: true,
        maxAttemptsReached: false,
      });
    });

    await vi.waitFor(() =>
      expect(bannerSpy).toBeCalledWith({
        header: "Hello World Header",
        body: "Hello World Body",
        pathnameToDisplayOn: "/dashboard",
      }),
    );

    vi.useRealTimers();
  });

  test("calls error banner if submission fails", async () => {
    const bannerSpy = vi.spyOn(banner, "banner");

    renderFormWithPackageSection(
      <ActionForm
        title="Action Form Title"
        schema={z.object({
          id: z.string(),
        })}
        defaultValues={{ id: SUBMISSION_ERROR_ITEM_ID }}
        fields={() => null}
        documentPollerArgs={{
          property: "id",
          documentChecker: () => true,
        }}
        bannerPostSubmission={{
          header: "Hello World Header",
          body: "Hello World Body",
        }}
        breadcrumbText="Example Breadcrumb"
      />,
      SUBMISSION_ERROR_ITEM_ID,
      "Medicaid SPA",
    );
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

    const submitButton = await screen.findByTestId("submit-action-form");

    fireEvent.submit(submitButton);

    await vi.waitFor(() =>
      expect(bannerSpy).toBeCalledWith({
        header: "An unexpected error has occurred:",
        body: "Error submitting form: Request failed with status code 500",
        pathnameToDisplayOn: "/",
        variant: "destructive",
      }),
    );
  });

  test("calls error banner on submit if fetch fails", async () => {
    const dataPollerSpy = vi.spyOn(DataPoller.prototype, "startPollingData");
    const bannerSpy = vi.spyOn(banner, "banner");

    renderFormWithPackageSection(
      <ActionForm
        title="Action Form Title"
        schema={z.object({
          id: z.string(),
        })}
        defaultValues={{ id: GET_ERROR_ITEM_ID }}
        fields={() => null}
        documentPollerArgs={{
          property: "id",
          documentChecker: () => true,
        }}
        bannerPostSubmission={{
          header: "Hello World Header",
          body: "Hello World Body",
        }}
        breadcrumbText="Example Breadcrumb"
      />,
      GET_ERROR_ITEM_ID,
      "Medicaid SPA",
    );
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

    const submitBtn = await screen.findByTestId("submit-action-form");

    vi.useFakeTimers();

    fireEvent.submit(submitBtn);

    await vi.waitFor(async () => {
      await vi.runAllTimersAsync();
      expect(dataPollerSpy.mock.settledResults).toEqual([
        {
          type: "rejected",
          value: {
            correctDataStateFound: false,
            maxAttemptsReached: true,
            error: "Error fetching: Request failed with status code 500",
          },
        },
      ]);
    });

    await vi.waitFor(() =>
      expect(bannerSpy).toBeCalledWith({
        header: "An unexpected error has occurred:",
        body: "Error fetching: Request failed with status code 500",
        pathnameToDisplayOn: "/",
        variant: "destructive",
      }),
    );

    vi.useRealTimers();
  }, 30000);

  test("calls error banner on submit if document check fails", async () => {
    const dataPollerSpy = vi.spyOn(DataPoller.prototype, "startPollingData");
    const bannerSpy = vi.spyOn(banner, "banner");

    renderFormWithPackageSection(
      <ActionForm
        title="Action Form Title"
        schema={z.object({
          id: z.string(),
        })}
        defaultValues={{ id: EXISTING_ITEM_PENDING_ID }}
        fields={() => null}
        documentPollerArgs={{
          property: "id",
          documentChecker: () => false,
        }}
        bannerPostSubmission={{
          header: "Hello World Header",
          body: "Hello World Body",
        }}
        breadcrumbText="Example Breadcrumb"
      />,
      EXISTING_ITEM_PENDING_ID,
      "Medicaid SPA",
    );
    await waitForElementToBeRemoved(() => screen.getByLabelText("three-dots-loading"));

    const submitBtn = await screen.findByTestId("submit-action-form");

    vi.useFakeTimers();

    fireEvent.submit(submitBtn);

    await vi.waitFor(async () => {
      await vi.runAllTimersAsync();
      expect(dataPollerSpy.mock.settledResults).toEqual([
        {
          type: "rejected",
          value: {
            correctDataStateFound: false,
            maxAttemptsReached: true,
            error: "Error polling data: Correct data state not found, after max attempts reached",
          },
        },
      ]);
    });

    await vi.waitFor(() =>
      expect(bannerSpy).toBeCalledWith({
        header: "An unexpected error has occurred:",
        body: "Error polling data: Correct data state not found, after max attempts reached",
        pathnameToDisplayOn: "/",
        variant: "destructive",
      }),
    );

    vi.useRealTimers();
  }, 30000);

  test("renders all attachment properties within `attachments`", async () => {
    renderForm(
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

    const otherAttachmentLabels = screen.queryAllByText("Other");

    expect(otherAttachmentLabels.length).toBe(3);
  });

  test("renders Additional Information if `additionalInformation` is defined in schema", async () => {
    renderForm(
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

    expect(screen.queryByText("Additional Information")).toBeInTheDocument();
  });

  test("doesn't render Additional Information if `additionalInformation` is undefined in schema", async () => {
    renderForm(
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

    expect(screen.queryByText("Additional Information")).not.toBeInTheDocument();
  });

  test("renders Attachments if `attachments` is defined in schema", async () => {
    renderForm(
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

    expect(screen.queryByText("Attachments")).toBeInTheDocument();
    expect(screen.queryByText("Other")).toBeInTheDocument();
  });

  test("doesn't render Attachments if `attachments` is undefined in schema", async () => {
    renderForm(
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

    expect(screen.queryByText("Attachments")).not.toBeInTheDocument();
  });

  test("renders ProgressReminder if schema has `attachments` property", async () => {
    renderForm(
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

    expect(screen.queryAllByText(PROGRESS_REMINDER).length).toBe(2);
  });

  test("renders ProgressReminder if `areFieldsRequired` property is undefined", async () => {
    renderForm(
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

    expect(screen.queryAllByText(PROGRESS_REMINDER).length).toBe(2);
  });

  test("doesn't render ProgressReminder if `areFieldsRequired` is false", () => {
    renderForm(
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

    expect(screen.queryByText(PROGRESS_REMINDER)).not.toBeInTheDocument();
  });

  test("renders default wrapper if `fieldsLayout` is undefined", async () => {
    renderForm(
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
      screen.queryAllByText(
        /Once you submit this form, a confirmation email is sent to you and to CMS./,
      ).length,
    ).toBe(2);
  });
});
