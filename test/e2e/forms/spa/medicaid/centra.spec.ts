import path from "node:path";
import { fileURLToPath } from "node:url";

import { expect, type Page, test } from "@playwright/test";
import { CE_HARDSHIP_KIND_LABELS, CE_PACKAGE_ID_FORMAT_MESSAGE } from "shared-types";

/** Matches `TEST_REVIEWER_USERNAME` in mocks/data/users/cmsReviewer.ts. */
const CMS_REVIEWER_USERNAME = "53832e35-1fbe-4c74-9111-4a0cd29ce2cf";

const fixturesDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../fixtures/centra",
);
const templatePdf = path.join(fixturesDir, "centra-template.pdf");
const supportingDocx = path.join(fixturesDir, "centra-supporting.docx");
const supportingDoc = path.join(fixturesDir, "centra-supporting.doc");
const evidencePng = path.join(fixturesDir, "centra-evidence.png");
const invalidZip = path.join(fixturesDir, "centra-invalid.zip");

const DUPLICATE_ID_MESSAGE =
  "According to our records, this Submission ID already exists. Please check the Submission ID and try entering it again.";
const UNAUTHORIZED_STATE_MESSAGE =
  "You can only submit for a state you have access to. If you need to add another state, visit your IDM user profile to request access.";

const useMockUser = async (page: Page, username: string) => {
  await page.addInitScript((nextUsername) => {
    window.localStorage.setItem("mako-mock-username", nextUsername);
  }, username);
};

const openCentraForm = async (page: Page) => {
  await page.goto("/dashboard");
  await page.getByTestId("new-sub-button").click();
  await expect(page.getByRole("link", { name: /State Plan Amendment \(SPA\)/ })).toContainText(
    "Community Engagement Short-Term Hardship Exception",
  );
  await page.getByRole("link", { name: /State Plan Amendment \(SPA\)/ }).click();
  await expect(page.getByRole("link", { name: /^Medicaid SPA/ })).toContainText(
    "Community Engagement Short-Term Hardship Exception",
  );
  await page.getByRole("link", { name: /^Medicaid SPA/ }).click();
  await expect(page.getByRole("link", { name: /^Additional Submissions/ })).toContainText(
    "Community Engagement Short-Term Hardship Exception",
  );
  await page.getByRole("link", { name: /^Additional Submissions/ }).click();
  await expect(page.getByTestId("detail-section-title")).toHaveText(
    "Community Engagement Short-Term Hardship Exception Details",
  );
  await expect(
    page.getByText("Your changes will be lost if you leave this page without saving.").first(),
  ).toBeVisible();
};

const selectRequestType = async (page: Page, label: string) => {
  await page.getByRole("combobox", { name: "Request Type" }).click();
  await page.getByRole("option", { name: label }).click();
  await expect(page.getByRole("combobox", { name: "Request Type" })).toContainText(label);
};

const selectState = async (page: Page, label: string) => {
  await page.getByRole("combobox", { name: "State" }).click();
  await page.getByRole("option", { name: label }).click();
};

const pickSubmissionDate = async (page: Page) => {
  await page.getByTestId("submissionDate-datepicker").click();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("submissionDate-datepicker")).not.toContainText("Pick a date");
};

const uploadSlot = async (page: Page, slot: "ceTemplate" | "other", filePath: string) => {
  await page.getByTestId(`${slot}-upload`).setInputFiles(filePath);
  await expect(page.getByTestId(`${path.basename(filePath)}-chip`)).toBeVisible();
};

test.describe("CEntra hardship exception", { tag: ["@centra"] }, () => {
  test.describe("happy paths", () => {
    test("shows the homepage highlight and system notification", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByRole("region", { name: "system-alert-banner" })).toContainText(
        "Community Engagement Short-Term Hardship Exception",
      );
      await expect(page.getByRole("heading", { name: "New and Notable", level: 2 })).toBeVisible();
      await expect(
        page.getByText("Submitted requests appear on the SPAs dashboard as"),
      ).toBeVisible();
      await expect(
        page.getByLabel("system-alert-banner").getByRole("link", {
          name: "View Community Engagement FAQs",
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("main").getByRole("link", { name: "View Community Engagement FAQs" }),
      ).toBeVisible();
    });

    test("submits a hardship exception from the Medicaid SPA cards", async ({ page }) => {
      test.setTimeout(90_000);
      await openCentraForm(page);

      for (const label of [
        CE_HARDSHIP_KIND_LABELS.CE_SADE,
        CE_HARDSHIP_KIND_LABELS.CE_NEA,
        CE_HARDSHIP_KIND_LABELS.CE_UNEMPLOYMENT,
      ]) {
        await selectRequestType(page, label);
      }

      await selectState(page, "Maryland (MD)");
      await page.locator("#ce-submission-id").fill("MD-CE-26-101");
      await expect(page.locator("#ce-submission-id")).toHaveValue("MD-CE-26-101");
      await pickSubmissionDate(page);
      await uploadSlot(page, "ceTemplate", templatePdf);
      await uploadSlot(page, "other", supportingDocx);
      await uploadSlot(page, "other", evidencePng);
      await page.locator("#additional-info").fill("E2E hardship note");

      await expect(page.getByTestId("submit-action-form")).toBeEnabled();
      await page.getByTestId("submit-action-form").click();

      await expect(page.getByTestId("banner-header")).toHaveText(
        "Community Engagement Short-Term Hardship Exception Request submitted.",
        { timeout: 20_000 },
      );
      await expect(page.getByTestId("banner-body")).toHaveText(
        "Your submission has been received.",
      );
      await expect(page).toHaveURL(/\/dashboard/);

      await page.locator("#search-input").fill("MD-CE-26-101");
      const row = page.getByRole("row", { name: /MD-CE-26-101/ });
      await expect(row).toContainText("CE Hardship Exception");
      await expect(row).toContainText(CE_HARDSHIP_KIND_LABELS.CE_UNEMPLOYMENT);
      await expect(row).toContainText("Submitted");
      await expect(row).not.toContainText("Intake Needed");
    });

    test("saves a draft and submits it from Continue Package", async ({ page }) => {
      test.setTimeout(90_000);
      await openCentraForm(page);
      await page.locator("#ce-submission-id").fill("MD-CE-26-210");
      await expect(page.getByRole("combobox", { name: "State" })).toContainText("Maryland (MD)");
      await page.getByTestId("save-draft-form").click();
      await expect(page.getByTestId("draft-save-status")).toContainText("Progress saved");

      await page.goto("/dashboard?tab=spas");
      await page.locator("#search-input").fill("MD-CE-26-210");
      const row = page.getByRole("row", { name: /MD-CE-26-210/ });
      await expect(row).toContainText("Draft");
      await row.getByTestId("available-actions").click();
      await page.getByRole("menuitem", { name: "Continue Package for MD-CE-26-210" }).click();

      await expect(page.locator("#ce-submission-id")).toHaveValue("MD-CE-26-210");
      await selectRequestType(page, CE_HARDSHIP_KIND_LABELS.CE_SADE);
      await pickSubmissionDate(page);
      await uploadSlot(page, "ceTemplate", templatePdf);
      await expect(page.getByTestId("submit-action-form")).toBeEnabled();
      await page.getByTestId("submit-action-form").click();
      await expect(page.getByTestId("banner-header")).toHaveText(
        "Community Engagement Short-Term Hardship Exception Request submitted.",
        { timeout: 20_000 },
      );
    });

    test("filters the SPAs grid by authority and request type", async ({ page }) => {
      await page.goto("/dashboard?tab=spas");
      await page.getByRole("button", { name: "Open filter panel" }).click();
      const panel = page.getByRole("dialog");
      await panel.getByRole("button", { name: "Authority", exact: true }).click();
      await panel.getByRole("checkbox", { name: "CE Hardship Exception" }).click();
      await panel.getByRole("button", { name: "Request Type", exact: true }).click();
      await expect(
        panel.getByRole("checkbox", { name: CE_HARDSHIP_KIND_LABELS.CE_UNEMPLOYMENT }),
      ).toBeVisible();
      await expect(
        panel.getByRole("checkbox", { name: CE_HARDSHIP_KIND_LABELS.CE_SADE }),
      ).toBeVisible();
      await expect(
        panel.getByRole("checkbox", { name: CE_HARDSHIP_KIND_LABELS.CE_NEA }),
      ).toBeVisible();
      await panel.getByRole("checkbox", { name: CE_HARDSHIP_KIND_LABELS.CE_UNEMPLOYMENT }).click();
      await panel.getByRole("checkbox", { name: CE_HARDSHIP_KIND_LABELS.CE_SADE }).click();
      await page.getByRole("button", { name: "Close" }).click();

      await expect(page.getByRole("link", { name: "MD-CE-26-001" })).toBeVisible();
      await expect(page.getByRole("link", { name: "MD-CE-26-002" })).toBeVisible();
      await expect(page.getByRole("link", { name: "MD-CE-26-003" })).toHaveCount(0);
      const unemploymentRow = page.getByRole("row", { name: /MD-CE-26-001/ });
      await expect(unemploymentRow).toContainText("CE Hardship Exception");
      await expect(unemploymentRow).toContainText("Submitted");
      await expect(unemploymentRow).not.toContainText("Intake Needed");
    });

    test("shows intake-needed status to a CMS reviewer", async ({ page }) => {
      await useMockUser(page, CMS_REVIEWER_USERNAME);
      await page.goto("/dashboard?tab=spas");
      await page.locator("#search-input").fill("MD-CE-26-001");
      const row = page.getByRole("row", { name: /MD-CE-26-001/ });
      await expect(row).toContainText("CE Hardship Exception");
      await expect(row).toContainText(CE_HARDSHIP_KIND_LABELS.CE_UNEMPLOYMENT);
      await expect(row).toContainText("Submitted - Intake Needed");
    });

    test("opens subsequent documents from the dashboard and package details", async ({ page }) => {
      test.setTimeout(90_000);
      await page.goto("/dashboard?tab=spas");
      await page.locator("#search-input").fill("MD-CE-26-001");
      const row = page.getByRole("row", { name: /MD-CE-26-001/ });
      await row.getByTestId("available-actions").click();
      await expect(
        page.getByRole("menuitem", { name: "Withdraw Package for MD-CE-26-001" }),
      ).toHaveCount(0);
      await page
        .getByRole("menuitem", { name: "Upload Subsequent Documents for MD-CE-26-001" })
        .click();
      await expect(page.getByTestId("ce-submission-id")).toHaveText("MD-CE-26-001");
      await expect(page.getByTestId("ce-request-type")).toHaveText(
        CE_HARDSHIP_KIND_LABELS.CE_UNEMPLOYMENT,
      );

      await page.goto("/details/CE_HARDSHIP_EXCEPTION/MD-CE-26-001"); // pragma: allowlist secret
      await expect(page.getByText("CE Hardship Exception", { exact: true })).toBeVisible();
      await expect(page.getByText(CE_HARDSHIP_KIND_LABELS.CE_UNEMPLOYMENT)).toBeVisible();
      await expect(page.getByText("Submission Date", { exact: true })).toBeVisible();
      await expect(
        page.getByText(
          "Community Engagement Short-Term Hardship Exception Submitted By Riley Quinn",
        ),
      ).toBeVisible();
      await expect(page.getByText("centra-template.pdf")).toBeVisible();
      await expect(page.getByRole("link", { name: "Withdraw Package" })).toHaveCount(0);
      await page.getByRole("link", { name: "Upload Subsequent Documents" }).click();

      await expect(page.getByText("New Subsequent Documentation")).toBeVisible();
      await expect(page.getByTestId("ce-submission-id")).toHaveText("MD-CE-26-001");
      await expect(page.getByTestId("ce-request-type")).toHaveText(
        CE_HARDSHIP_KIND_LABELS.CE_UNEMPLOYMENT,
      );
      await uploadSlot(page, "other", supportingDoc);
      await page.locator("#additional-info").fill("Updated unemployment evidence");
      await page.getByTestId("submit-action-form").click();
      await expect(page.getByTestId("dialog-title")).toHaveText("Submit additional documents?");
      await expect(page.getByTestId("dialog-body")).toContainText(
        "These documents will be added to the submission and reviewed by CMS.",
      );
      await page.getByTestId("dialog-accept").click();

      await expect(page.getByTestId("banner-header")).toHaveText("Documents submitted", {
        timeout: 20_000,
      });
      await expect(page.getByText("Submitted").first()).toBeVisible();
      await expect(page.getByText("Submitted - Intake Needed")).toHaveCount(0);
      await expect(
        page.getByText(/Subsequent documentation uploaded By Stateuser Tester/),
      ).toBeVisible();
      await expect(page.getByRole("link", { name: "Withdraw Package" })).toHaveCount(0);
    });
  });

  test.describe("sad paths", () => {
    test("blocks invalid, unauthorized, mismatched, and duplicate ids", async ({ page }) => {
      await openCentraForm(page);
      const id = page.locator("#ce-submission-id");

      await id.fill("MD-CE-26-0001");
      await expect(page.getByText(CE_PACKAGE_ID_FORMAT_MESSAGE)).toBeVisible();

      await id.fill("MD-26-0001");
      await expect(page.getByText(CE_PACKAGE_ID_FORMAT_MESSAGE)).toBeVisible();

      await id.fill("ZZ-CE-26-001");
      await expect(page.getByText(UNAUTHORIZED_STATE_MESSAGE)).toBeVisible();

      await selectState(page, "Maryland (MD)");
      await id.fill("AK-CE-26-001");
      await expect(id).toHaveValue("AK-CE-26-001");
      await expect(page.getByRole("combobox", { name: "State" })).toContainText("Maryland (MD)");
      await expect(page.getByText(UNAUTHORIZED_STATE_MESSAGE)).toBeVisible();
      await expect(page.getByTestId("submit-action-form")).toBeDisabled();

      await id.fill("MD-CE-26-001");
      await expect(page.getByText(DUPLICATE_ID_MESSAGE)).toBeVisible();
      await expect(page.getByTestId("submit-action-form")).toBeDisabled();
    });

    test("keeps submit disabled without attachments and rejects a zip file", async ({ page }) => {
      await openCentraForm(page);
      await selectRequestType(page, CE_HARDSHIP_KIND_LABELS.CE_NEA);
      await page.locator("#ce-submission-id").fill("MD-CE-26-301");
      await pickSubmissionDate(page);
      await expect(page.getByTestId("submit-action-form")).toBeDisabled();

      await page.getByTestId("ceTemplate-upload").setInputFiles(invalidZip);
      await expect(page.getByText('File "centra-invalid.zip" has an invalid type.')).toBeVisible();
      await expect(page.getByTestId("submit-action-form")).toBeDisabled();
    });

    test("stops additional information at 4,000 characters", async ({ page }) => {
      await openCentraForm(page);
      const additionalInfo = page.locator("#additional-info");
      await additionalInfo.fill("a".repeat(4000));
      await expect(page.getByText("0 characters remaining")).toBeVisible();
      await additionalInfo.press("b");
      await expect(additionalInfo).toHaveValue("a".repeat(4000));
    });

    test("blocks subsequent documents until a file and a reason are both present", async ({
      page,
    }) => {
      await page.goto(
        "/actions/upload-subsequent-documents/CE_HARDSHIP_EXCEPTION/MD-CE-26-002?origin=details",
      );
      await expect(page.getByTestId("ce-submission-id")).toHaveText("MD-CE-26-002");
      await page.locator("#additional-info").fill("   ");
      await uploadSlot(page, "ceTemplate", templatePdf);
      await expect(page.getByTestId("submit-action-form")).toBeDisabled();

      await page.locator("#additional-info").fill("A real reason");
      await expect(page.getByTestId("submit-action-form")).toBeEnabled();
      await page.getByTestId("ceTemplate-remove-file-centra-template.pdf").click();
      await page.getByTestId("dialog-accept").click();
      await expect(page.getByTestId("submit-action-form")).toBeDisabled();

      await uploadSlot(page, "other", supportingDoc);
      await page.locator("#additional-info").fill("   ");
      await expect(page.getByTestId("submit-action-form")).toBeDisabled();
    });

    test("returns to the subsequent documents form when the confirm modal is cancelled", async ({
      page,
    }) => {
      await page.goto(
        "/actions/upload-subsequent-documents/CE_HARDSHIP_EXCEPTION/MD-CE-26-003?origin=details",
      );
      await uploadSlot(page, "other", supportingDoc);
      await page.locator("#additional-info").fill("Adding a scanned letter");
      await page.getByTestId("submit-action-form").click();
      await expect(page.getByTestId("dialog-title")).toHaveText("Submit additional documents?");
      await page.getByTestId("dialog-cancel").click();
      await expect(page.getByTestId("dialog-title")).toHaveCount(0);
      await expect(page.getByTestId("ce-submission-id")).toHaveText("MD-CE-26-003");
      await expect(page.getByTestId("banner-header")).toHaveCount(0);
      await expect(page).toHaveURL(/upload-subsequent-documents/);
    });

    test("redirects a CMS reviewer away from the new submission form", async ({ page }) => {
      await useMockUser(page, CMS_REVIEWER_USERNAME);
      await page.goto("/new-submission/spa/medicaid/create/centra");
      await expect(page).toHaveURL(/localhost:5000\/?$/);
      await expect(page.getByTestId("detail-section-title")).toHaveCount(0);
    });

    test("shows an error banner and keeps the form when submit returns 500", async ({ page }) => {
      test.setTimeout(60_000);
      await openCentraForm(page);
      await selectRequestType(page, CE_HARDSHIP_KIND_LABELS.CE_SADE);
      await page.locator("#ce-submission-id").fill("MD-CE-26-500");
      await pickSubmissionDate(page);
      await uploadSlot(page, "ceTemplate", templatePdf);
      await expect(page.getByTestId("submit-action-form")).toBeEnabled();
      await page.getByTestId("submit-action-form").click();

      await expect(page.getByTestId("banner-header")).toHaveText(
        "An unexpected error has occurred:",
        { timeout: 20_000 },
      );
      await expect(page.locator("#ce-submission-id")).toHaveValue("MD-CE-26-500");
      await expect(page.getByTestId("centra-template.pdf-chip")).toBeVisible();
      await expect(page).toHaveURL(/\/centra/);
    });
  });
});
