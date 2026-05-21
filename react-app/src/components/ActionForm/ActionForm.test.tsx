import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  EXISTING_ITEM_PENDING_ID,
  GET_ERROR_ITEM_ID,
  setDefaultReviewer,
  setDefaultStateSubmitter,
  SUBMISSION_ERROR_ITEM_ID,
  TEST_STATE_SUBMITTER_EMAIL,
} from "mocks";
import { attachmentArraySchemaOptional, SEATOOL_STATUS } from "shared-types";
import { isCmsReadonlyUser } from "shared-utils";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";

import * as api from "@/api";
import * as components from "@/components";
import { queryClient } from "@/utils";
import {
  DRAFT_ID_CONFLICT_BANNER_TITLE,
  DRAFT_ID_CONFLICT_MESSAGE,
  getDraftIdConflictFieldMessage,
  getNonOwnerDraftWarningModalBody,
  markDraftContinueConfirmed,
} from "@/utils/drafts";
import { DataPoller } from "@/utils/Poller/DataPoller";
import * as documentPoller from "@/utils/Poller/documentPoller";
import { renderWithQueryClientAndMemoryRouter } from "@/utils/test-helpers/render";
import { renderFormWithPackageSectionAsync } from "@/utils/test-helpers/renderForm";

const mockUseFeatureFlag = vi.hoisted(() => vi.fn((flag: string) => flag === "SAVE_IN_PROGRESS"));
const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    Navigate: () => null,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: mockUseFeatureFlag,
}));

import { ActionForm } from "./index";
const PROGRESS_REMINDER = /If you leave this page, you will lose your progress on this form./;
const SAVE_PROGRESS_REMINDER = "You will lose progress if you leave this page without saving.";
const MEDICAID_DRAFT_ID_CONFLICT_FIELD_MESSAGE =
  getDraftIdConflictFieldMessage("new-medicaid-submission");
const sendGAEventSpy = vi.spyOn(await import("@/utils/ReactGA/SendGAEvent"), "sendGAEvent");
describe("ActionForm", () => {
  beforeEach(() => {
    setDefaultStateSubmitter();
    vi.clearAllMocks();
    mockUseFeatureFlag.mockImplementation((flag: string) => flag === "SAVE_IN_PROGRESS");
    vi.spyOn(api, "itemExists").mockResolvedValue(false);
    sessionStorage.clear();
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

    expect(screen.getByTestId("detail-section-title")).toHaveTextContent("Action Form Title");
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

  test("uses custom ProgressReminder in the form header and footer", async () => {
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
        formDescriptionProgressLossReminder={SAVE_PROGRESS_REMINDER}
      />,
    );

    expect(screen.queryAllByText(SAVE_PROGRESS_REMINDER).length).toBe(2);
    expect(screen.queryByText(PROGRESS_REMINDER)).not.toBeInTheDocument();
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

  test("does not expose draft save controls when save-in-progress is disabled", async () => {
    mockUseFeatureFlag.mockReturnValue(false);

    await renderFormWithPackageSectionAsync(
      <ActionForm
        title="Draft flag test"
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

    expect(screen.queryByTestId("save-draft-form")).not.toBeInTheDocument();
    expect(screen.getByTestId("submit-action-form")).toHaveTextContent("Submit");
  });

  test("does not show leave-form prompt on first draft save", async () => {
    const user = userEvent.setup();
    const userPromptSpy = vi.spyOn(components, "userPrompt").mockImplementation(() => undefined);
    const bannerSpy = vi.spyOn(components, "banner");
    const removeQueriesSpy = vi.spyOn(queryClient, "removeQueries");
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

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
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ["record", "MD-00-0001"],
    });
    expect(removeQueriesSpy).not.toHaveBeenCalledWith({
      queryKey: ["record", "MD-00-0001"],
    });

    expect(userPromptSpy).not.toHaveBeenCalled();
    expect(
      JSON.parse(sessionStorage.getItem("onemac:draft-save-route-transition") ?? "{}"),
    ).toEqual(
      expect.objectContaining({
        id: "MD-00-0001",
        pathname: "/test/Medicaid SPA",
        expiresAt: expect.any(Number),
      }),
    );
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
    const removeQueriesSpy = vi.spyOn(queryClient, "removeQueries");
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
            createdByEmail: TEST_STATE_SUBMITTER_EMAIL,
            updatedByEmail: TEST_STATE_SUBMITTER_EMAIL,
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
        originalDraftId: draftId,
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
        originalDraftId: draftId,
        event: "new-medicaid-submission",
        ifSeqNo: 6,
        ifPrimaryTerm: 1,
      }),
    );
    expect(removeQueriesSpy).not.toHaveBeenCalledWith({
      queryKey: ["record", draftId],
    });

    removeQueriesSpy.mockRestore();
    useGetItemSpy.mockRestore();
    saveDraftSpy.mockRestore();
  });

  test("does not remove the old draft query before navigating after a draft ID change", async () => {
    const user = userEvent.setup();
    const oldDraftId = "NY-25-2342";
    const newDraftId = "MD-26-0108-P";
    const removeQueriesSpy = vi.spyOn(queryClient, "removeQueries");
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");
    const useGetItemSpy = vi.spyOn(api, "useGetItem").mockReturnValue({
      data: {
        _id: oldDraftId,
        _seq_no: 5,
        _primary_term: 1,
        found: true,
        _source: {
          id: oldDraftId,
          seatoolStatus: SEATOOL_STATUS.DRAFT,
          draft: {
            savedAt: "2026-02-26T00:00:00.000Z",
            createdByEmail: TEST_STATE_SUBMITTER_EMAIL,
            updatedByEmail: TEST_STATE_SUBMITTER_EMAIL,
            data: { id: oldDraftId },
          },
        },
      },
      isLoading: false,
      isFetched: true,
      error: null,
    } as any);
    const saveDraftSpy = vi.spyOn(api, "saveDraft").mockResolvedValue({
      message: "Draft saved",
      id: newDraftId,
      seqNo: 6,
      primaryTerm: 1,
    });

    await renderFormWithPackageSectionAsync(
      <ActionForm
        title="Draft Save Test"
        schema={z.object({
          id: z.string().min(1),
        })}
        fields={(form) => <input aria-label="Package ID" {...form.register("id")} />}
        defaultValues={{ id: oldDraftId }}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        draftOptions={{ enabled: true, event: "new-medicaid-submission" }}
        breadcrumbText="Example Breadcrumb"
      />,
      undefined,
      "Medicaid SPA",
      `draftId=${oldDraftId}`,
    );

    const packageIdField = screen.getByLabelText("Package ID");
    await user.clear(packageIdField);
    await user.type(packageIdField, newDraftId);
    await user.click(screen.getByTestId("save-draft-form"));

    await waitFor(() => expect(saveDraftSpy).toHaveBeenCalledTimes(1));
    expect(saveDraftSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: newDraftId,
        originalDraftId: oldDraftId,
        event: "new-medicaid-submission",
      }),
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ["record", newDraftId],
    });
    expect(invalidateQueriesSpy).not.toHaveBeenCalledWith({
      queryKey: ["record", oldDraftId],
    });
    expect(removeQueriesSpy).not.toHaveBeenCalledWith({
      queryKey: ["record", oldDraftId, "preferDraft"],
      exact: true,
    });
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining(`draftId=${newDraftId}`), {
      replace: true,
    });

    removeQueriesSpy.mockRestore();
    useGetItemSpy.mockRestore();
    saveDraftSpy.mockRestore();
  });

  test("keeps the form visible while a saved draft route transition is unresolved", async () => {
    const draftId = "MD-26-0108-P";
    sessionStorage.setItem(
      "onemac:draft-save-route-transition",
      JSON.stringify({
        id: draftId,
        pathname: "/draft-route",
        expiresAt: Date.now() + 30_000,
      }),
    );
    const useGetItemSpy = vi.spyOn(api, "useGetItem").mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetched: true,
      error: null,
    } as any);
    const form = (
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
      />
    );

    renderWithQueryClientAndMemoryRouter(
      form,
      [
        {
          path: "/draft-route",
          element: form,
        },
      ],
      { initialEntries: [`/draft-route?draftId=${draftId}`] },
    );

    await waitFor(() =>
      expect(screen.getByTestId("detail-section-title")).toHaveTextContent("Draft Save Test"),
    );
    expect(screen.queryByTestId("three-dots-loading")).not.toBeInTheDocument();
    expect(screen.queryByText("No active draft package was found.")).not.toBeInTheDocument();

    useGetItemSpy.mockRestore();
  });

  test("does not render an error when a draft route no longer has an active draft", async () => {
    const draftId = "MD-26-8120-P";
    const useGetItemSpy = vi.spyOn(api, "useGetItem").mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetched: true,
      error: null,
    } as any);
    const form = (
      <ActionForm
        title="Deleted Draft Test"
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
      />
    );

    renderWithQueryClientAndMemoryRouter(
      form,
      [
        {
          path: "/draft-route",
          element: form,
        },
      ],
      { initialEntries: [`/draft-route?draftId=${draftId}`] },
    );

    await waitFor(() =>
      expect(screen.queryByText("No active draft package was found.")).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true }));
    expect(screen.queryByText("An error has occurred")).not.toBeInTheDocument();
    expect(screen.queryByTestId("detail-section-title")).not.toBeInTheDocument();

    useGetItemSpy.mockRestore();
  });

  test("does not render an error when a draft refetch returns not found", async () => {
    const draftId = "MD-26-8120-P";
    const useGetItemSpy = vi.spyOn(api, "useGetItem").mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetched: true,
      error: {
        response: {
          status: 404,
          data: { message: "No record found for the given id" },
        },
      },
    } as any);
    const form = (
      <ActionForm
        title="Deleted Draft Test"
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
      />
    );

    renderWithQueryClientAndMemoryRouter(
      form,
      [
        {
          path: "/draft-route",
          element: form,
        },
      ],
      { initialEntries: [`/draft-route?draftId=${draftId}`] },
    );

    await waitFor(() =>
      expect(screen.queryByText("An error has occurred")).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true }));
    expect(screen.queryByText("No record found for the given id")).not.toBeInTheDocument();
    expect(screen.queryByTestId("detail-section-title")).not.toBeInTheDocument();

    useGetItemSpy.mockRestore();
  });

  test("redirects an inactive draft route when the draft lookup fails without a recognizable 404 shape", async () => {
    const draftId = "MD-26-8120-P";
    const useGetItemSpy = vi.spyOn(api, "useGetItem").mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetched: true,
      error: new Error("Request failed"),
    } as any);
    const form = (
      <ActionForm
        title="Deleted Draft Test"
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
      />
    );

    renderWithQueryClientAndMemoryRouter(
      form,
      [
        {
          path: "/draft-route",
          element: form,
        },
      ],
      { initialEntries: [`/draft-route?draftId=${draftId}`] },
    );

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true }));
    expect(screen.queryByText("An error has occurred")).not.toBeInTheDocument();
    expect(screen.queryByTestId("detail-section-title")).not.toBeInTheDocument();

    useGetItemSpy.mockRestore();
  });

  test("does not render an error when a stale cached draft refetch returns a generic error", async () => {
    const draftId = "MD-25-3524-JJJJ";
    const useGetItemSpy = vi.spyOn(api, "useGetItem").mockReturnValue({
      data: {
        _id: draftId,
        found: true,
        _source: {
          id: draftId,
          seatoolStatus: SEATOOL_STATUS.DRAFT,
          draft: {
            savedAt: "2026-02-26T00:00:00.000Z",
            createdByEmail: TEST_STATE_SUBMITTER_EMAIL,
            updatedByEmail: TEST_STATE_SUBMITTER_EMAIL,
            data: { id: draftId },
          },
          changelog: [],
        },
      },
      isLoading: false,
      isFetched: true,
      error: new Error("Request failed"),
    } as any);
    const form = (
      <ActionForm
        title="Deleted Draft Test"
        schema={z.object({
          id: z.string().min(1),
        })}
        fields={(form) => <input aria-label="Package ID" {...form.register("id")} />}
        defaultValues={{ id: draftId }}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        draftOptions={{ enabled: true, event: "new-chip-submission" }}
        breadcrumbText="Example Breadcrumb"
      />
    );

    renderWithQueryClientAndMemoryRouter(
      form,
      [
        {
          path: "/draft-route",
          element: form,
        },
      ],
      { initialEntries: [`/draft-route?draftId=${draftId}`] },
    );

    await waitFor(() =>
      expect(screen.queryByText("An error has occurred")).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true }));
    expect(screen.queryByTestId("detail-section-title")).not.toBeInTheDocument();

    useGetItemSpy.mockRestore();
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
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");
    const dataPollerSpy = vi.spyOn(DataPoller.prototype, "startPollingData").mockResolvedValue({
      correctDataStateFound: true,
      maxAttemptsReached: false,
    });
    const useGetItemSpy = vi.spyOn(api, "useGetItem").mockReturnValue({
      data: {
        _id: draftId,
        found: true,
        _source: {
          id: draftId,
          seatoolStatus: SEATOOL_STATUS.DRAFT,
          draft: {
            savedAt: "2026-02-26T00:00:00.000Z",
            createdByEmail: TEST_STATE_SUBMITTER_EMAIL,
            updatedByEmail: TEST_STATE_SUBMITTER_EMAIL,
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
    await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["record"] });
    expect(mockNavigate.mock.invocationCallOrder.at(-1)).toBeLessThan(
      invalidateQueriesSpy.mock.invocationCallOrder.at(-1) ?? 0,
    );

    invalidateQueriesSpy.mockRestore();
    dataPollerSpy.mockRestore();
    useGetItemSpy.mockRestore();
  });

  test("does not flash missing draft error while an existing draft is being submitted", async () => {
    const draftId = "MD-25-2525-SAVE";
    let draftDisappeared = false;
    const useGetItemSpy = vi.spyOn(api, "useGetItem").mockImplementation(
      () =>
        ({
          data: draftDisappeared
            ? undefined
            : {
                _id: draftId,
                found: true,
                _source: {
                  id: draftId,
                  seatoolStatus: SEATOOL_STATUS.DRAFT,
                  draft: {
                    savedAt: "2026-02-26T00:00:00.000Z",
                    createdByEmail: TEST_STATE_SUBMITTER_EMAIL,
                    updatedByEmail: TEST_STATE_SUBMITTER_EMAIL,
                    data: { id: draftId },
                  },
                  changelog: [],
                },
              },
          isLoading: false,
          isFetched: true,
          error: null,
        }) as any,
    );
    vi.spyOn(api, "itemExists").mockImplementation(async () => {
      draftDisappeared = true;
      return false;
    });

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
          documentChecker: () => true,
        }}
        draftOptions={{ enabled: true, event: "new-medicaid-submission" }}
        breadcrumbText="Example Breadcrumb"
      />,
      undefined,
      "Medicaid SPA",
      `draftId=${draftId}`,
    );

    fireEvent.submit(await screen.findByTestId("submit-action-form"));

    await waitFor(() => expect(screen.getByTestId("three-dots-loading")).toBeInTheDocument());
    expect(screen.queryByText("No active draft package was found.")).not.toBeInTheDocument();

    useGetItemSpy.mockRestore();
  });

  test("shows warning modal when a non-owner saves a draft and allows continue", async () => {
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
    const saveDraftSpy = vi.spyOn(api, "saveDraft").mockResolvedValue({
      message: "Draft saved",
      id: draftId,
      seqNo: 1,
      primaryTerm: 1,
    });

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

    expect(userPromptSpy).not.toHaveBeenCalled();
    await user.click(screen.getByTestId("save-draft-form"));

    await waitFor(() =>
      expect(userPromptSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          header: "Confirm action",
          body: getNonOwnerDraftWarningModalBody(draftId),
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
    expect(saveDraftSpy).not.toHaveBeenCalled();
    firstPromptArgs.onAccept();

    expect(userPromptSpy).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(saveDraftSpy).toHaveBeenCalledTimes(1));
    useGetItemSpy.mockRestore();
    saveDraftSpy.mockRestore();
  });

  test("does not show the non-owner warning after the user confirms from Continue Package", async () => {
    const user = userEvent.setup();
    const draftId = "NY-25-2342";
    markDraftContinueConfirmed(draftId, TEST_STATE_SUBMITTER_EMAIL);
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
    const saveDraftSpy = vi.spyOn(api, "saveDraft").mockResolvedValue({
      message: "Draft saved",
      id: draftId,
      seqNo: 1,
      primaryTerm: 1,
    });

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

    await user.click(screen.getByTestId("save-draft-form"));

    await waitFor(() => expect(saveDraftSpy).toHaveBeenCalledTimes(1));
    expect(userPromptSpy).not.toHaveBeenCalled();
    useGetItemSpy.mockRestore();
    saveDraftSpy.mockRestore();
  });

  test("does not show the non-owner warning for a legacy draft owned by the current user name", async () => {
    const user = userEvent.setup();
    const draftId = "MD-26-0108-P";
    const useGetItemSpy = vi.spyOn(api, "useGetItem").mockReturnValue({
      data: {
        _id: draftId,
        found: true,
        _source: {
          id: draftId,
          seatoolStatus: SEATOOL_STATUS.DRAFT,
          draft: {
            savedAt: "2026-02-26T00:00:00.000Z",
            draftOwnerName: "Stateuser Tester",
            data: { id: draftId },
          },
        },
      },
      isLoading: false,
      error: null,
    } as any);
    const userPromptSpy = vi.spyOn(components, "userPrompt").mockImplementation(() => undefined);
    const saveDraftSpy = vi.spyOn(api, "saveDraft").mockResolvedValue({
      message: "Draft saved",
      id: draftId,
      seqNo: 1,
      primaryTerm: 1,
    });

    await renderFormWithPackageSectionAsync(
      <ActionForm
        title="Legacy Draft Owner Test"
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
    expect(userPromptSpy).not.toHaveBeenCalled();
    useGetItemSpy.mockRestore();
    saveDraftSpy.mockRestore();
  });

  test("shows duplicate ID conflict on draft save and replaces the warning after saving an updated ID", async () => {
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
            createdByEmail: TEST_STATE_SUBMITTER_EMAIL,
            updatedByEmail: TEST_STATE_SUBMITTER_EMAIL,
            data: { id: draftId },
          },
        },
      },
      isLoading: false,
      error: null,
    } as any);
    const saveDraftSpy = vi.spyOn(api, "saveDraft").mockResolvedValue({
      message: "Draft saved",
      id: `${draftId}-NEW`,
      seqNo: 11,
      primaryTerm: 3,
    });
    vi.mocked(api.itemExists).mockResolvedValue(true);

    await renderFormWithPackageSectionAsync(
      <ActionForm
        title="Draft conflict test"
        schema={z.object({
          id: z.string().min(1),
        })}
        fields={(form) => (
          <>
            <input aria-label="Package ID" {...form.register("id")} />
            {form.formState.errors.id?.message && (
              <p role="alert" data-testid="draft-id-error">
                {String(form.formState.errors.id.message)}
              </p>
            )}
          </>
        )}
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

    await waitFor(() =>
      expect(bannerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          header: DRAFT_ID_CONFLICT_BANNER_TITLE,
          body: DRAFT_ID_CONFLICT_MESSAGE,
          variant: "warning",
        }),
      ),
    );
    expect(saveDraftSpy).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Package ID")).not.toBeDisabled();
    expect(screen.getByTestId("draft-id-error")).toHaveTextContent(
      MEDICAID_DRAFT_ID_CONFLICT_FIELD_MESSAGE,
    );
    expect(screen.getByTestId("save-draft-form")).toBeDisabled();
    expect(screen.getByTestId("draft-save-status")).toHaveTextContent(DRAFT_ID_CONFLICT_MESSAGE);

    await user.type(screen.getByLabelText("Package ID"), "-NEW");

    await waitFor(() => expect(screen.queryByTestId("draft-id-error")).not.toBeInTheDocument());
    await waitFor(() => expect(screen.getByTestId("save-draft-form")).not.toBeDisabled());

    vi.mocked(api.itemExists).mockResolvedValue(false);
    await user.click(screen.getByTestId("save-draft-form"));

    await waitFor(() =>
      expect(saveDraftSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: `${draftId}-NEW`,
          originalDraftId: draftId,
        }),
      ),
    );
    await waitFor(() =>
      expect(bannerSpy).toHaveBeenLastCalledWith(
        expect.objectContaining({
          header: "Progress saved",
          body: `Changes made to ${draftId}-NEW have been saved.`,
          variant: "success",
        }),
      ),
    );

    useGetItemSpy.mockRestore();
    saveDraftSpy.mockRestore();
  });

  test("does not show the draft ID update banner for a duplicate ID before first draft save", async () => {
    const user = userEvent.setup();
    const bannerSpy = vi.spyOn(components, "banner").mockImplementation(() => undefined);
    const saveDraftSpy = vi.spyOn(api, "saveDraft").mockResolvedValue({
      message: "Draft saved",
      id: "MD-26-0511-P",
      seqNo: 1,
      primaryTerm: 1,
    });
    vi.mocked(api.itemExists).mockResolvedValue(true);

    await renderFormWithPackageSectionAsync(
      <ActionForm
        title="Draft conflict test"
        schema={z.object({
          id: z.string().min(1),
        })}
        fields={(form) => (
          <>
            <input aria-label="Package ID" {...form.register("id")} />
            {form.formState.errors.id?.message && (
              <p role="alert" data-testid="draft-id-error">
                {String(form.formState.errors.id.message)}
              </p>
            )}
          </>
        )}
        defaultValues={{ id: "MD-26-0511-P" }}
        documentPollerArgs={{
          property: () => "id",
          documentChecker: () => true,
        }}
        draftOptions={{ enabled: true, event: "new-medicaid-submission" }}
        breadcrumbText="Example Breadcrumb"
      />,
    );

    await user.click(screen.getByTestId("save-draft-form"));

    expect(saveDraftSpy).not.toHaveBeenCalled();
    expect(bannerSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        header: DRAFT_ID_CONFLICT_BANNER_TITLE,
        body: DRAFT_ID_CONFLICT_MESSAGE,
        variant: "warning",
      }),
    );
    expect(screen.getByTestId("draft-id-error")).toHaveTextContent(
      MEDICAID_DRAFT_ID_CONFLICT_FIELD_MESSAGE,
    );
    expect(screen.getByTestId("draft-save-status")).toHaveTextContent(
      MEDICAID_DRAFT_ID_CONFLICT_FIELD_MESSAGE,
    );

    saveDraftSpy.mockRestore();
  });

  test("sets inline ID error when backend detects duplicate draft ID during save", async () => {
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
            createdByEmail: TEST_STATE_SUBMITTER_EMAIL,
            updatedByEmail: TEST_STATE_SUBMITTER_EMAIL,
            data: { id: draftId },
          },
        },
      },
      isLoading: false,
      error: null,
    } as any);
    const conflictError = Object.assign(new Error(DRAFT_ID_CONFLICT_MESSAGE), {
      response: { status: 409 },
    });
    const saveDraftSpy = vi.spyOn(api, "saveDraft").mockRejectedValue(conflictError);
    vi.mocked(api.itemExists).mockResolvedValueOnce(false).mockResolvedValue(true);

    await renderFormWithPackageSectionAsync(
      <ActionForm
        title="Draft conflict test"
        schema={z.object({
          id: z.string().min(1),
        })}
        fields={(form) => (
          <>
            <input aria-label="Package ID" {...form.register("id")} />
            {form.formState.errors.id?.message && (
              <p role="alert" data-testid="draft-id-error">
                {String(form.formState.errors.id.message)}
              </p>
            )}
          </>
        )}
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
    expect(bannerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        header: DRAFT_ID_CONFLICT_BANNER_TITLE,
        body: DRAFT_ID_CONFLICT_MESSAGE,
        variant: "warning",
      }),
    );
    expect(screen.getByTestId("draft-id-error")).toHaveTextContent(
      MEDICAID_DRAFT_ID_CONFLICT_FIELD_MESSAGE,
    );
    expect(screen.getByTestId("save-draft-form")).toBeDisabled();
    expect(screen.getByTestId("draft-save-status")).toHaveTextContent(DRAFT_ID_CONFLICT_MESSAGE);

    await user.type(screen.getByLabelText("Package ID"), "-NEW");

    await waitFor(() => expect(screen.queryByTestId("draft-id-error")).not.toBeInTheDocument());
    await waitFor(() => expect(screen.getByTestId("save-draft-form")).not.toBeDisabled());

    useGetItemSpy.mockRestore();
    saveDraftSpy.mockRestore();
  });

  test("re-enables draft actions after a previously conflicting ID becomes available again", async () => {
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
            createdByEmail: TEST_STATE_SUBMITTER_EMAIL,
            updatedByEmail: TEST_STATE_SUBMITTER_EMAIL,
            data: { id: draftId },
          },
        },
      },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(api.itemExists)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValue(false);

    await renderFormWithPackageSectionAsync(
      <ActionForm
        title="Draft conflict test"
        schema={z.object({
          id: z.string().min(1),
        })}
        fields={(form) => (
          <>
            <input aria-label="Package ID" {...form.register("id")} />
            {form.formState.errors.id?.message && (
              <p role="alert" data-testid="draft-id-error">
                {String(form.formState.errors.id.message)}
              </p>
            )}
          </>
        )}
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

    await waitFor(() => expect(screen.getByTestId("save-draft-form")).toBeDisabled());
    expect(screen.getByTestId("draft-id-error")).toHaveTextContent(
      MEDICAID_DRAFT_ID_CONFLICT_FIELD_MESSAGE,
    );
    expect(bannerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        header: DRAFT_ID_CONFLICT_BANNER_TITLE,
        body: DRAFT_ID_CONFLICT_MESSAGE,
        variant: "warning",
      }),
    );

    fireEvent.focus(window);

    await waitFor(() => expect(screen.getByTestId("save-draft-form")).not.toBeDisabled());
    await waitFor(() => expect(screen.queryByTestId("draft-id-error")).not.toBeInTheDocument());

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

    await userEvent.click(screen.getByTestId("save-draft-form"));
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
