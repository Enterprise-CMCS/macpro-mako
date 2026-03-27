import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  EXISTING_ITEM_PENDING_ID,
  GET_ERROR_ITEM_ID,
  helpDeskUser,
  setDefaultReviewer,
  setDefaultStateSubmitter,
  setMockUsername,
  SUBMISSION_ERROR_ITEM_ID,
} from "mocks";
import { attachmentArraySchemaOptional, SEATOOL_STATUS } from "shared-types";
import { isCmsReadonlyUser } from "shared-utils";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";

import * as api from "@/api";
import * as components from "@/components";
import { DataPoller } from "@/utils/Poller/DataPoller";
import * as documentPoller from "@/utils/Poller/documentPoller";
import { renderFormWithPackageSectionAsync } from "@/utils/test-helpers/renderForm";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    Navigate: () => null,
    useNavigate: () => mockNavigate,
  };
});

import { ActionForm } from "./index";
const PROGRESS_REMINDER = /If you leave this page, you will lose your progress on this form./;
const sendGAEventSpy = vi.spyOn(await import("@/utils/ReactGA/SendGAEvent"), "sendGAEvent");
describe("ActionForm", () => {
  beforeEach(() => {
    setDefaultStateSubmitter();
    vi.clearAllMocks();
    vi.spyOn(api, "itemExists").mockResolvedValue(false);
    window.gtag = vi.fn();
  });

  test("renders `breadcrumbText`", async () => {
    await renderFormWithPackageSectionAsync(
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

    expect(screen.queryByText("Example Breadcrumb")).toBeInTheDocument();
  });

  test("renders `title`", async () => {
    await renderFormWithPackageSectionAsync(
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

    expect(screen.queryByText("Action Form Title")).toBeInTheDocument();
  });

  test("renders `attachments.faqLink`", async () => {
    await renderFormWithPackageSectionAsync(
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
        attachments={{ faqLink: "/hello-world-link" }}
        breadcrumbText="Example Breadcrumb"
      />,
    );

    expect(screen.queryByText("FAQ Page")).toHaveAttribute("href", "/hello-world-link");
  });

  test("renders `attachments.title`", async () => {
    await renderFormWithPackageSectionAsync(
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

    expect(screen.queryByText("this is an attachments title")).toBeInTheDocument();
  });

  test("doesn't render form if user access is denied", async () => {
    setDefaultReviewer();

    await renderFormWithPackageSectionAsync(
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

    expect(screen.queryByText("Action Form Title")).not.toBeInTheDocument();
    setDefaultStateSubmitter();
  });

  test("renders `defaultValues` in appropriate input", async () => {
    await renderFormWithPackageSectionAsync(
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

    expect(screen.queryByDisplayValue("default value for id")).toBeInTheDocument();
  });

  test("renders `attachments.instructions`", async () => {
    await renderFormWithPackageSectionAsync(
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

    expect(screen.queryByText(/hello world special instructions./)).toBeInTheDocument();
  });

  test("renders `attachments.callout`", async () => {
    await renderFormWithPackageSectionAsync(
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

    expect(screen.queryByText(/this is a callout/)).toBeInTheDocument();
  });

  test("renders custom `promptOnLeavingForm` when clicking Cancel", async () => {
    const user = userEvent.setup();

    const onAcceptMock = vi.fn();
    const userPromptSpy = vi
      .spyOn(components, "userPrompt")
      .mockImplementation((args) => (args.onAccept = onAcceptMock));

    await renderFormWithPackageSectionAsync(
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

    const cancelBtn = await screen.findByTestId("cancel-action-form");
    await user.click(cancelBtn);

    expect(userPromptSpy).toBeCalledWith({
      header: "Hello World Header",
      body: "Hello World Body",
      onAccept: onAcceptMock,
    });
    expect(sendGAEventSpy).toHaveBeenCalledWith(
      "submit_cancel",
      expect.objectContaining({
        submission_type: "Action Form Title",
        time_on_page_sec: expect.any(Number),
      }),
    );
  });

  test("renders custom `promptPreSubmission` when clicking Submit", async () => {
    const user = userEvent.setup();

    const onAcceptMock = vi.fn();
    const userPromptSpy = vi
      .spyOn(components, "userPrompt")
      .mockImplementation((args) => (args.onAccept = onAcceptMock));

    await renderFormWithPackageSectionAsync(
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

    const submitBtn = await screen.findByTestId("submit-action-form");
    await user.click(submitBtn);

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

    await renderFormWithPackageSectionAsync(
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
      EXISTING_ITEM_PENDING_ID,
    );

    expect(sendGAEventSpy).toHaveBeenCalledWith(
      "submit_page_open",
      expect.objectContaining({
        submission_type: "Action Form Title",
      }),
    );

    fireEvent.submit(await screen.findByTestId("submit-action-form"));

    await waitFor(() =>
      expect(documentPollerSpy).toHaveBeenCalledWith(EXISTING_ITEM_PENDING_ID, documentChecker, {
        includeDraft: false,
      }),
    );
  });

  test("calls `banner` with `bannerPostSubmission`", async () => {
    const dataPollerSpy = vi.spyOn(DataPoller.prototype, "startPollingData");
    const bannerSpy = vi.spyOn(components, "banner");

    await renderFormWithPackageSectionAsync(
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
    );

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
    expect(sendGAEventSpy).toHaveBeenCalledWith("submission_submit_click", expect.anything());
    expect(sendGAEventSpy).toHaveBeenCalledWith("submit_page_exit", expect.anything());
    vi.useRealTimers();
  });

  test("calls error banner if submission fails", async () => {
    const bannerSpy = vi.spyOn(components, "banner");

    await renderFormWithPackageSectionAsync(
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
    );

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
    const bannerSpy = vi.spyOn(components, "banner");

    await renderFormWithPackageSectionAsync(
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
    );

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
            message: "Error polling data: Correct data state not found, after max attempts reached",
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

  test("calls error banner on submit if document check fails", async () => {
    const dataPollerSpy = vi.spyOn(DataPoller.prototype, "startPollingData");
    const bannerSpy = vi.spyOn(components, "banner");

    await renderFormWithPackageSectionAsync(
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
    );

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
            message: "Error polling data: Correct data state not found, after max attempts reached",
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
    await renderFormWithPackageSectionAsync(
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

    const otherAttachmentLabels = screen.queryAllByText("Other");

    expect(otherAttachmentLabels.length).toBe(3);
  });

  test("renders Additional Information if `additionalInformation` is defined in schema", async () => {
    await renderFormWithPackageSectionAsync(
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

    expect(screen.queryByText("Additional Information")).toBeInTheDocument();
  });

  test("doesn't render Additional Information if `additionalInformation` is undefined in schema", async () => {
    await renderFormWithPackageSectionAsync(
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

    expect(screen.queryByText("Additional Information")).not.toBeInTheDocument();
  });

  test("renders Attachments if `attachments` is defined in schema", async () => {
    await renderFormWithPackageSectionAsync(
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

    expect(screen.queryByText("Attachments")).toBeInTheDocument();
    expect(screen.queryByText("Other")).toBeInTheDocument();
  });

  test("doesn't render Attachments if `attachments` is undefined in schema", async () => {
    await renderFormWithPackageSectionAsync(
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

    expect(screen.queryByText("Attachments")).not.toBeInTheDocument();
  });

  test("renders ProgressReminder if schema has `attachments` property", async () => {
    await renderFormWithPackageSectionAsync(
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

    expect(screen.queryAllByText(PROGRESS_REMINDER).length).toBe(2);
  });

  test("renders ProgressReminder if `areFieldsRequired` property is undefined", async () => {
    await renderFormWithPackageSectionAsync(
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

    expect(screen.queryAllByText(PROGRESS_REMINDER).length).toBe(2);
  });

  test("doesn't render ProgressReminder if `areFieldsRequired` is false", async () => {
    await renderFormWithPackageSectionAsync(
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

  test("does not show leave-form prompt on first draft save", async () => {
    const user = userEvent.setup();
    const userPromptSpy = vi.spyOn(components, "userPrompt").mockImplementation(() => undefined);
    const bannerSpy = vi.spyOn(components, "banner");

    await renderFormWithPackageSectionAsync(
      <ActionForm
        title="Draft Save Test"
        schema={z.object({
          id: z.string().min(1),
        })}
        fields={(form) => <input aria-label="Package ID" {...form.register("id")} />}
        defaultValues={{ id: "" }}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        draftOptions={{ enabled: true, event: "new-medicaid-submission" }}
        breadcrumbText="Example Breadcrumb"
      />,
    );

    await user.type(screen.getByLabelText("Package ID"), "MD-00-0001");
    await user.click(screen.getByTestId("save-draft-form"));

    await waitFor(() =>
      expect(bannerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          header: "Progress saved",
          body: "Changes made to MD-00-0001 have been saved.",
          variant: "success",
        }),
      ),
    );
    await waitFor(() =>
      expect(screen.getByTestId("draft-save-status")).toHaveTextContent(/^Progress saved at /),
    );

    expect(userPromptSpy).not.toHaveBeenCalled();
  });

  test("shows unsaved changes status after editing a saved draft", async () => {
    const user = userEvent.setup();
    const saveDraftSpy = vi.spyOn(api, "saveDraft").mockResolvedValue({
      message: "Draft saved",
      id: "MD-00-0003",
      seqNo: 1,
      primaryTerm: 1,
    });

    await renderFormWithPackageSectionAsync(
      <ActionForm
        title="Draft Save Test"
        schema={z.object({
          id: z.string().min(1),
        })}
        fields={(form) => <input aria-label="Package ID" {...form.register("id")} />}
        defaultValues={{ id: "" }}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        draftOptions={{ enabled: true, event: "new-medicaid-submission" }}
        breadcrumbText="Example Breadcrumb"
      />,
    );

    const packageIdField = screen.getByLabelText("Package ID");
    await user.type(packageIdField, "MD-00-0003");
    await user.click(screen.getByTestId("save-draft-form"));

    await waitFor(() =>
      expect(screen.getByTestId("draft-save-status")).toHaveTextContent(/^Progress saved at /),
    );

    await user.type(packageIdField, "A");

    await waitFor(() =>
      expect(screen.getByTestId("draft-save-status")).toHaveTextContent("Unsaved changes"),
    );

    saveDraftSpy.mockRestore();
  });

  test("uses and rolls optimistic concurrency values while saving an existing draft", async () => {
    const user = userEvent.setup();
    const draftId = "NY-25-2342";
    const useGetItemSpy = vi.spyOn(api, "useGetItem").mockReturnValue({
      data: {
        _id: draftId,
        _seq_no: 5,
        _primary_term: 1,
        found: true,
        _source: {
          id: draftId,
          seatoolStatus: SEATOOL_STATUS.DRAFT,
          draft: {
            savedAt: "2026-02-26T00:00:00.000Z",
            data: { id: draftId },
          },
        },
      },
      isLoading: false,
      error: null,
    } as any);
    const saveDraftSpy = vi
      .spyOn(api, "saveDraft")
      .mockResolvedValueOnce({
        message: "Draft saved",
        id: draftId,
        seqNo: 6,
        primaryTerm: 1,
      })
      .mockResolvedValueOnce({
        message: "Draft saved",
        id: draftId,
        seqNo: 7,
        primaryTerm: 1,
      });

    await renderFormWithPackageSectionAsync(
      <ActionForm
        title="Draft Save Test"
        schema={z.object({
          id: z.string().min(1),
        })}
        fields={(form) => <input aria-label="Package ID" {...form.register("id")} />}
        defaultValues={{ id: draftId }}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        draftOptions={{ enabled: true, event: "new-medicaid-submission" }}
        breadcrumbText="Example Breadcrumb"
      />,
      undefined,
      "Medicaid SPA",
      `draftId=${draftId}`,
    );

    await user.click(screen.getByTestId("save-draft-form"));
    await waitFor(() => expect(saveDraftSpy).toHaveBeenCalledTimes(1));
    expect(saveDraftSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        id: draftId,
        event: "new-medicaid-submission",
        ifSeqNo: 5,
        ifPrimaryTerm: 1,
      }),
    );

    await user.click(screen.getByTestId("save-draft-form"));
    await waitFor(() => expect(saveDraftSpy).toHaveBeenCalledTimes(2));
    expect(saveDraftSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        id: draftId,
        event: "new-medicaid-submission",
        ifSeqNo: 6,
        ifPrimaryTerm: 1,
      }),
    );

    useGetItemSpy.mockRestore();
    saveDraftSpy.mockRestore();
  });

  test("ignores duplicate save clicks while a draft save is already in flight", async () => {
    let resolveSaveDraft: ((value: api.SaveDraftResponse) => void) | undefined;
    const saveDraftSpy = vi.spyOn(api, "saveDraft").mockImplementation(
      () =>
        new Promise<api.SaveDraftResponse>((resolve) => {
          resolveSaveDraft = resolve;
        }),
    );

    await renderFormWithPackageSectionAsync(
      <ActionForm
        title="Draft Save Test"
        schema={z.object({
          id: z.string().min(1),
        })}
        fields={(form) => <input aria-label="Package ID" {...form.register("id")} />}
        defaultValues={{ id: "MD-00-0002" }}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        draftOptions={{ enabled: true, event: "new-medicaid-submission" }}
        breadcrumbText="Example Breadcrumb"
      />,
    );

    const saveButton = await screen.findByTestId("save-draft-form");
    fireEvent.click(saveButton);
    fireEvent.click(saveButton);

    await waitFor(() => expect(saveDraftSpy).toHaveBeenCalledTimes(1));

    resolveSaveDraft?.({
      message: "Draft saved",
      id: "MD-00-0002",
      seqNo: 1,
      primaryTerm: 1,
    });

    await waitFor(() => expect(saveDraftSpy).toHaveBeenCalledTimes(1));

    saveDraftSpy.mockRestore();
  });

  test("polls with includeDraft enabled while submitting an existing draft", async () => {
    const draftId = "MD-25-2525-SAVE";
    const useGetItemSpy = vi.spyOn(api, "useGetItem").mockReturnValue({
      data: {
        _id: draftId,
        found: true,
        _source: {
          id: draftId,
          seatoolStatus: SEATOOL_STATUS.DRAFT,
          draft: {
            savedAt: "2026-02-26T00:00:00.000Z",
            data: { id: draftId },
          },
          changelog: [],
        },
      },
      isLoading: false,
      error: null,
    } as any);
    const documentPollerSpy = vi.spyOn(documentPoller, "documentPoller");
    const documentChecker: documentPoller.CheckDocumentFunction = () => true;

    await renderFormWithPackageSectionAsync(
      <ActionForm
        title="Draft Submit Test"
        schema={z.object({
          id: z.string().min(1),
        })}
        fields={(form) => <input aria-label="Package ID" {...form.register("id")} />}
        defaultValues={{ id: draftId }}
        documentPollerArgs={{
          property: "id",
          documentChecker,
        }}
        draftOptions={{ enabled: true, event: "new-medicaid-submission" }}
        breadcrumbText="Example Breadcrumb"
      />,
      undefined,
      "Medicaid SPA",
      `draftId=${draftId}`,
    );

    fireEvent.submit(await screen.findByTestId("submit-action-form"));

    await waitFor(() =>
      expect(documentPollerSpy).toHaveBeenCalledWith(draftId, expect.any(Function), {
        includeDraft: true,
      }),
    );

    useGetItemSpy.mockRestore();
  });

  test("shows warning modal when a non-owner opens a draft and allows continue", async () => {
    const user = userEvent.setup();
    const draftId = "NY-25-2342";
    const useGetItemSpy = vi.spyOn(api, "useGetItem").mockReturnValue({
      data: {
        _id: draftId,
        found: true,
        _source: {
          id: draftId,
          seatoolStatus: SEATOOL_STATUS.DRAFT,
          draft: {
            savedAt: "2026-02-26T00:00:00.000Z",
            draftOwnerEmail: "someone.else@example.com",
            data: { id: draftId },
          },
        },
      },
      isLoading: false,
      error: null,
    } as any);
    const userPromptSpy = vi.spyOn(components, "userPrompt").mockImplementation(() => undefined);

    await renderFormWithPackageSectionAsync(
      <ActionForm
        title="Draft owner test"
        schema={z.object({
          id: z.string().min(1),
        })}
        fields={(form) => <input aria-label="Package ID" {...form.register("id")} />}
        defaultValues={{ id: draftId }}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        draftOptions={{ enabled: true, event: "new-medicaid-submission" }}
        breadcrumbText="Example Breadcrumb"
      />,
      undefined,
      "Medicaid SPA",
      `draftId=${draftId}`,
    );

    await waitFor(() =>
      expect(userPromptSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          header: "Confirm action",
          body: `Since you are not the draft owner, are you sure you want to take this action on ${draftId}?`,
          acceptButtonText: "Yes, continue",
          cancelButtonText: "Cancel",
        }),
      ),
    );

    const firstPromptArgs = userPromptSpy.mock.calls[0][0] as {
      body: string;
      onAccept: () => void;
    };
    expect(firstPromptArgs.body).not.toMatch(/delete draft package/i);
    firstPromptArgs.onAccept();
    await user.click(screen.getByTestId("save-draft-form"));

    expect(userPromptSpy).toHaveBeenCalledTimes(1);
    useGetItemSpy.mockRestore();
  });

  test("shows a lock banner on open and disables draft actions when a matching SEA package exists", async () => {
    const draftId = "MD-26-7685-P";
    const bannerSpy = vi.spyOn(components, "banner").mockImplementation(() => undefined);
    const useGetItemSpy = vi.spyOn(api, "useGetItem").mockReturnValue({
      data: {
        _id: draftId,
        found: true,
        _source: {
          id: draftId,
          seatoolStatus: SEATOOL_STATUS.DRAFT,
          draft: {
            savedAt: "2026-03-12T00:00:00.000Z",
            data: { id: draftId },
          },
        },
      },
      isLoading: false,
      error: null,
    } as any);
    vi.mocked(api.itemExists).mockResolvedValue(true);

    await renderFormWithPackageSectionAsync(
      <ActionForm
        title="Draft lock test"
        schema={z.object({
          id: z.string().min(1),
        })}
        fields={(form) => <input aria-label="Package ID" {...form.register("id")} />}
        defaultValues={{ id: draftId }}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        draftOptions={{ enabled: true, event: "new-medicaid-submission" }}
        breadcrumbText="Example Breadcrumb"
      />,
      undefined,
      "Medicaid SPA",
      `draftId=${draftId}`,
    );

    expect(screen.getByText("This draft is locked")).toBeInTheDocument();
    expect(screen.getByLabelText("Package ID")).toBeDisabled();
    expect(screen.getByTestId("save-draft-form")).toBeDisabled();
    expect(screen.getByTestId("submit-action-form")).toBeDisabled();
    expect(bannerSpy).not.toHaveBeenCalled();

    useGetItemSpy.mockRestore();
  });

  test("shows the lock banner to helpdesk users when a conflicting draft is opened", async () => {
    const draftId = "MD-26-7685-P";
    await setMockUsername(helpDeskUser);
    const useGetItemSpy = vi.spyOn(api, "useGetItem").mockReturnValue({
      data: {
        _id: draftId,
        found: true,
        _source: {
          id: draftId,
          seatoolStatus: SEATOOL_STATUS.DRAFT,
          draft: {
            savedAt: "2026-03-12T00:00:00.000Z",
            data: { id: draftId },
          },
        },
      },
      isLoading: false,
      error: null,
    } as any);
    vi.mocked(api.itemExists).mockResolvedValue(true);

    await renderFormWithPackageSectionAsync(
      <ActionForm
        title="Draft lock test"
        schema={z.object({
          id: z.string().min(1),
        })}
        fields={(form) => <input aria-label="Package ID" {...form.register("id")} />}
        defaultValues={{ id: draftId }}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        draftOptions={{ enabled: true, event: "new-medicaid-submission" }}
        conditionsDeterminingUserAccess={[() => true]}
        breadcrumbText="Example Breadcrumb"
      />,
      undefined,
      "Medicaid SPA",
      `draftId=${draftId}`,
    );

    expect(screen.getByText("This draft is locked")).toBeInTheDocument();

    useGetItemSpy.mockRestore();
  });

  test("shows a friendly lock message if a draft save races with a new SEA submission", async () => {
    const user = userEvent.setup();
    const draftId = "MD-26-7685-P";
    const bannerSpy = vi.spyOn(components, "banner").mockImplementation(() => undefined);
    const useGetItemSpy = vi.spyOn(api, "useGetItem").mockReturnValue({
      data: {
        _id: draftId,
        found: true,
        _source: {
          id: draftId,
          seatoolStatus: SEATOOL_STATUS.DRAFT,
          draft: {
            savedAt: "2026-03-12T00:00:00.000Z",
            data: { id: draftId },
          },
        },
      },
      isLoading: false,
      error: null,
    } as any);
    vi.spyOn(api, "saveDraft").mockRejectedValue({
      response: {
        status: 409,
      },
    });

    await renderFormWithPackageSectionAsync(
      <ActionForm
        title="Draft lock test"
        schema={z.object({
          id: z.string().min(1),
        })}
        fields={(form) => <input aria-label="Package ID" {...form.register("id")} />}
        defaultValues={{ id: draftId }}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        draftOptions={{ enabled: true, event: "new-medicaid-submission" }}
        breadcrumbText="Example Breadcrumb"
      />,
      undefined,
      "Medicaid SPA",
      `draftId=${draftId}`,
    );

    await user.click(screen.getByTestId("save-draft-form"));

    await waitFor(() => expect(screen.getByText("This draft is locked")).toBeInTheDocument());
    expect(screen.getByLabelText("Package ID")).toBeDisabled();
    expect(screen.getByTestId("save-draft-form")).toBeDisabled();
    expect(screen.getByTestId("submit-action-form")).toBeDisabled();
    expect(screen.getByTestId("draft-save-status")).toHaveTextContent("Draft locked");
    expect(bannerSpy).not.toHaveBeenCalled();

    useGetItemSpy.mockRestore();
  });

  test("redirects away when non-owner cancels the draft warning modal", async () => {
    const draftId = "NY-25-2342";
    const useGetItemSpy = vi.spyOn(api, "useGetItem").mockReturnValue({
      data: {
        _id: draftId,
        found: true,
        _source: {
          id: draftId,
          seatoolStatus: SEATOOL_STATUS.DRAFT,
          draft: {
            savedAt: "2026-02-26T00:00:00.000Z",
            draftOwnerEmail: "someone.else@example.com",
            data: { id: draftId },
          },
        },
      },
      isLoading: false,
      error: null,
    } as any);
    const userPromptSpy = vi.spyOn(components, "userPrompt").mockImplementation(() => undefined);

    await renderFormWithPackageSectionAsync(
      <ActionForm
        title="Draft owner test"
        schema={z.object({
          id: z.string().min(1),
        })}
        fields={(form) => <input aria-label="Package ID" {...form.register("id")} />}
        defaultValues={{ id: draftId }}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        draftOptions={{ enabled: true, event: "new-medicaid-submission" }}
        breadcrumbText="Example Breadcrumb"
      />,
      undefined,
      "Medicaid SPA",
      `draftId=${draftId}`,
    );

    await waitFor(() => expect(userPromptSpy).toHaveBeenCalledTimes(1));
    const firstPromptArgs = userPromptSpy.mock.calls[0][0] as {
      onCancel?: () => void;
    };
    firstPromptArgs.onCancel?.();

    expect(mockNavigate).toHaveBeenCalled();
    const firstNavigateArg = mockNavigate.mock.calls[0][0];
    if (firstNavigateArg !== -1) {
      expect(firstNavigateArg).toEqual(expect.objectContaining({ pathname: "/dashboard" }));
    }

    useGetItemSpy.mockRestore();
  });

  test("calls onSubmit directly when `promptPreSubmission` is not defined", async () => {
    const user = userEvent.setup();

    // Spy on userPrompt to ensure it's NOT called
    const userPromptSpy = vi.spyOn(components, "userPrompt").mockImplementation(() => undefined);

    await renderFormWithPackageSectionAsync(
      <ActionForm
        title="Test No Prompt"
        schema={z.object({})}
        fields={() => null}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        breadcrumbText="Example Breadcrumb"
        // Mock the real submit logic so we can assert it
      />,
    );

    const submitBtn = await screen.findByTestId("submit-action-form");
    await user.click(submitBtn);

    expect(userPromptSpy).not.toHaveBeenCalled();
  });
});
