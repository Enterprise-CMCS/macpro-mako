import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CE_HARDSHIP_KIND_LABELS, CE_PACKAGE_ID_FORMAT_MESSAGE } from "shared-types";
import { beforeAll, describe, expect, test, vi } from "vitest";

import { formSchemas } from "@/formSchemas";
import { renderFormWithPackageSectionAsync } from "@/utils/test-helpers";
import { mockApiRefinements, skipCleanup } from "@/utils/test-helpers/skipCleanup";
import { uploadFiles } from "@/utils/test-helpers/uploadFiles";

import { authorizedStateFromCeId, CentraForm, syncCeIdPrefix } from "./Centra";
import {
  CENTRA_FORM_DESCRIPTION,
  CENTRA_FORM_TITLE,
  CENTRA_ID_EXAMPLE,
  CENTRA_SUCCESS_HEADER,
  NEW_SUBMISSION_PROGRESS_LOSS_REMINDER,
} from "./content";

vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: (flag: string) => flag === "SAVE_IN_PROGRESS",
}));

const upload = uploadFiles<(typeof formSchemas)["ce-record-submitted"]>();

describe("CEntra id helpers", () => {
  test("rewrites only a CE id prefix", () => {
    expect(syncCeIdPrefix("VA", "MD-CE-26-001")).toBe("VA-CE-26-001");
    expect(syncCeIdPrefix("VA", "md-ce-26-001")).toBe("VA-CE-26-001");
    expect(syncCeIdPrefix("VA", "")).toBe("");
    expect(authorizedStateFromCeId("MD-CE-26-001", ["MD", "VA"])).toBe("MD");
    expect(authorizedStateFromCeId("AK-CE-26-001", ["MD"])).toBeNull();
  });
});

describe("Centra form", () => {
  beforeAll(async () => {
    skipCleanup();
    mockApiRefinements();
    await renderFormWithPackageSectionAsync(<CentraForm />);
  });

  test("renders the CEntra intro, request types, and draft actions", async () => {
    expect(screen.getByTestId("detail-section-title")).toHaveTextContent(CENTRA_FORM_TITLE);
    expect(screen.getByTestId("detail-section")).toHaveTextContent(CENTRA_FORM_DESCRIPTION);
    expect(screen.getByTestId("detail-section")).toHaveTextContent(
      NEW_SUBMISSION_PROGRESS_LOSS_REMINDER,
    );
    const infoBanner = screen
      .getAllByRole("alert")
      .find((alert) => alert.textContent?.includes(CENTRA_FORM_DESCRIPTION));
    expect(infoBanner).toHaveTextContent(CENTRA_FORM_DESCRIPTION);
    expect(infoBanner).toHaveTextContent(NEW_SUBMISSION_PROGRESS_LOSS_REMINDER);
    expect(screen.getByText(CENTRA_ID_EXAMPLE)).toBeInTheDocument();
    expect(screen.getByTestId("ceTemplate-label")).toHaveTextContent("Template");
    expect(screen.getByTestId("other-label")).toHaveTextContent("Other Supporting Documentation");
    expect(screen.getByTestId("save-draft-form")).toHaveTextContent("Save");
    expect(screen.getByTestId("submit-action-form")).toHaveTextContent("Save & Submit");
    expect(screen.getByTestId("submit-action-form")).toBeDisabled();

    await userEvent.click(screen.getByRole("combobox", { name: "Request Type" }));
    expect(
      await screen.findByRole("option", { name: CE_HARDSHIP_KIND_LABELS.CE_SADE }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: CE_HARDSHIP_KIND_LABELS.CE_UNEMPLOYMENT }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: CE_HARDSHIP_KIND_LABELS.CE_NEA }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("option", { name: CE_HARDSHIP_KIND_LABELS.CE_SADE }));
  });

  test("validates the submission id and keeps the state prefix in sync", async () => {
    const idInput = screen.getByLabelText(/Submission ID/);

    await userEvent.type(idInput, "MD-CE-26-0001");
    expect(await screen.findByText(CE_PACKAGE_ID_FORMAT_MESSAGE)).toBeInTheDocument();

    await userEvent.clear(idInput);
    await userEvent.type(idInput, "MD-CE-26-001");

    await waitFor(() => {
      expect(screen.getByRole("combobox", { name: "State" })).toHaveTextContent("Maryland (MD)");
    });

    await userEvent.click(screen.getByRole("combobox", { name: "State" }));
    await userEvent.click(await screen.findByRole("option", { name: "Virginia (VA)" }));
    expect(idInput).toHaveValue("VA-CE-26-001");

    await userEvent.click(screen.getByRole("combobox", { name: "State" }));
    await userEvent.click(await screen.findByRole("option", { name: "Maryland (MD)" }));
    expect(idInput).toHaveValue("MD-CE-26-001");
  });

  test("requires additional information before enabling Save & Submit", async () => {
    expect(screen.getByTestId("additional-info")).toHaveTextContent("Additional Information");
    expect(screen.getByTestId("additional-info").querySelector(".text-red-600")).toHaveTextContent(
      "*",
    );

    const idInput = screen.getByLabelText(/Submission ID/);
    await userEvent.clear(idInput);
    await userEvent.type(idInput, "MD-CE-26-101");
    await waitFor(() => {
      expect(screen.getByRole("combobox", { name: "State" })).toHaveTextContent("Maryland (MD)");
    });

    await userEvent.click(screen.getByTestId("submissionDate-datepicker"));
    await userEvent.keyboard("{Enter}");
    expect(screen.getByTestId("submit-action-form")).toBeDisabled();

    await upload("ceTemplate");
    expect(screen.getByTestId("submit-action-form")).toBeDisabled();

    await userEvent.type(
      screen.getByLabelText(/Add anything else you would like to share with CMS/),
      "   ",
    );
    expect(screen.getByTestId("submit-action-form")).toBeDisabled();

    await userEvent.clear(
      screen.getByLabelText(/Add anything else you would like to share with CMS/),
    );
    await userEvent.type(
      screen.getByLabelText(/Add anything else you would like to share with CMS/),
      "County unemployment rates attached.",
    );

    await waitFor(() => expect(screen.getByTestId("submit-action-form")).toBeEnabled());
    expect(screen.getByTestId("submit-action-form")).toHaveTextContent("Save & Submit");
    expect(CENTRA_SUCCESS_HEADER).toMatch(/Request submitted\./);
  });
});
