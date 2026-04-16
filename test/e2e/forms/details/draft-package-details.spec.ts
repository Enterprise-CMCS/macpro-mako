import { Page } from "@playwright/test";
import { API_ENDPOINT, HttpResponse, testStateSubmitter, USER_POOL_CLIENT_ID } from "mocks";
import { SEATOOL_STATUS } from "shared-types";

import { expect, test } from "@/fixtures/mocked";

import {
  generateAccessToken,
  generateIdToken,
  generateRefreshToken,
} from "../../../../mocks/handlers/auth.utils";
import { TestUserDataWithRole } from "../../../../mocks/index.d";

const filePath = "../test/fixtures/upload-sample.png";
const CHIP_DRAFT_ID = "MD-25-9001-IJJJ";

type DraftRecord = {
  _id: string;
  found: true;
  _source: {
    id: string;
    event: string;
    authority: string;
    seatoolStatus: string;
    stateStatus: string;
    cmsStatus: string;
    actionType: string;
    state: string;
    origin: string;
    submitterName: string;
    submitterEmail: string;
    changedDate: string;
    makoChangedDate: string;
    statusDate: string;
    draft: {
      savedAt: string;
      draftOwnerName: string;
      draftOwnerEmail: string;
      createdByName: string;
      createdByEmail: string;
      data: Record<string, unknown>;
    };
    changelog: [];
    deleted?: boolean;
  };
};

const getUserAttribute = (user: TestUserDataWithRole, name: string) =>
  user.UserAttributes.find((attribute) => attribute.Name === name)?.Value ?? "";

const buildDraftRecord = ({
  id,
  event = "new-chip-details-submission",
  authority = "CHIP SPA",
  draftData,
}: {
  id: string;
  event?: string;
  authority?: string;
  draftData: Record<string, unknown>;
}): DraftRecord => {
  const savedAt = new Date().toISOString();
  const submitterEmail = getUserAttribute(testStateSubmitter, "email");
  const submitterName = `${getUserAttribute(testStateSubmitter, "given_name")} ${getUserAttribute(
    testStateSubmitter,
    "family_name",
  )}`.trim();
  const state = id.split("-")[0] ?? "MD";

  return {
    _id: id,
    found: true,
    _source: {
      id,
      event,
      authority,
      seatoolStatus: SEATOOL_STATUS.DRAFT,
      stateStatus: "Draft",
      cmsStatus: "Draft",
      actionType: "New",
      state,
      origin: "OneMAC",
      submitterName,
      submitterEmail,
      changedDate: savedAt,
      makoChangedDate: savedAt,
      statusDate: savedAt,
      draft: {
        savedAt,
        draftOwnerName: submitterName,
        draftOwnerEmail: submitterEmail,
        createdByName: submitterName,
        createdByEmail: submitterEmail,
        data: draftData,
      },
      changelog: [],
    },
  };
};

const installMockAuth = async (page: Page, user: TestUserDataWithRole) => {
  const username = user.Username;
  const authTime = Math.floor(Date.now() / 1000);
  const expTime = authTime + 1800;
  const accessToken = await generateAccessToken(user, authTime, expTime);
  const idToken = await generateIdToken(user, authTime, expTime);
  const refreshToken = await generateRefreshToken(user);

  await page.addInitScript(
    ({
      clientId,
      username,
      accessToken,
      idToken,
      refreshToken,
      userData,
    }: {
      clientId: string;
      username: string;
      accessToken: string | null;
      idToken: string | null;
      refreshToken: string | null;
      userData: string;
    }) => {
      window.localStorage.setItem(
        `CognitoIdentityServiceProvider.${clientId}.LastAuthUser`,
        username,
      );
      window.localStorage.setItem(
        `CognitoIdentityServiceProvider.${clientId}.${username}.accessToken`,
        accessToken || "",
      );
      window.localStorage.setItem(
        `CognitoIdentityServiceProvider.${clientId}.${username}.clockDrift`,
        "0",
      );
      window.localStorage.setItem(
        `CognitoIdentityServiceProvider.${clientId}.${username}.idToken`,
        idToken || "",
      );
      window.localStorage.setItem(
        `CognitoIdentityServiceProvider.${clientId}.${username}.refreshToken`,
        refreshToken || "",
      );
      window.localStorage.setItem(
        `CognitoIdentityServiceProvider.${clientId}.${username}.userData`,
        userData,
      );
      window.localStorage.setItem("amplify-redirected-from-hosted-ui", "true");
      window.localStorage.setItem("amplify-signin-with-hostedUI", "true");
    },
    {
      clientId: USER_POOL_CLIENT_ID,
      username,
      accessToken,
      idToken,
      refreshToken,
      userData: JSON.stringify({
        UserAttributes: user.UserAttributes,
        Username: username,
      }),
    },
  );
};

test.describe("Draft Package Details", { tag: ["@drafts", "@e2e"] }, () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await installMockAuth(page, testStateSubmitter);
  });

  test("state user can save a chip draft, view package details, and delete it", async ({
    page,
    worker,
    http,
  }) => {
    let draftRecord: DraftRecord | null = null;

    worker.use(
      http.post(`${API_ENDPOINT}/saveDraft`, async ({ request }) => {
        const payload = (await request.json()) as {
          id: string;
          event: string;
          authority?: string;
          draftData: Record<string, unknown>;
        };

        draftRecord = buildDraftRecord({
          id: payload.id.toUpperCase(),
          event: payload.event,
          authority: payload.authority ?? "CHIP SPA",
          draftData: payload.draftData,
        });

        return HttpResponse.json({
          message: "Draft saved",
          id: payload.id.toUpperCase(),
          seqNo: 1,
          primaryTerm: 1,
        });
      }),
      http.post(`${API_ENDPOINT}/item`, async ({ request }) => {
        const { id } = (await request.json()) as { id: string };
        const normalizedId = id?.trim().toUpperCase();

        if (
          draftRecord &&
          normalizedId === draftRecord._source.id &&
          draftRecord._source.deleted !== true
        ) {
          return HttpResponse.json(draftRecord);
        }

        return new HttpResponse(null, { status: 404 });
      }),
      http.post(`${API_ENDPOINT}/itemExists`, async ({ request }) => {
        const { id, includeDrafts } = (await request.json()) as {
          id: string;
          includeDrafts?: boolean;
        };
        const normalizedId = id?.trim().toUpperCase();
        const isActiveDraft =
          !!draftRecord &&
          normalizedId === draftRecord._source.id &&
          draftRecord._source.deleted !== true;

        return HttpResponse.json({
          exists: includeDrafts ? isActiveDraft : false,
          ...(includeDrafts && isActiveDraft ? { status: draftRecord?._source.seatoolStatus } : {}),
        });
      }),
      http.post(`${API_ENDPOINT}/deleteDraft`, async ({ request }) => {
        const { id } = (await request.json()) as { id: string };
        const normalizedId = id?.trim().toUpperCase();

        if (
          !draftRecord ||
          normalizedId !== draftRecord._source.id ||
          draftRecord._source.deleted
        ) {
          return HttpResponse.json({ message: "Package is not an active draft." }, { status: 409 });
        }

        draftRecord = {
          ...draftRecord,
          _source: {
            ...draftRecord._source,
            deleted: true,
          },
        } as DraftRecord;

        return HttpResponse.json({ message: "Draft deleted", id: normalizedId });
      }),
    );

    await page.goto("/new-submission/spa/chip/create/chip-details?origin=spas");

    await page.locator("#spa-id").fill(CHIP_DRAFT_ID);
    await page.getByTestId("proposedEffectiveDate-datepicker").click();
    await page.keyboard.press("Enter");
    await page.getByTestId("chipEligibility-upload").setInputFiles(filePath);
    await expect(page.getByTestId("upload-sample.png-chip")).toBeVisible();

    await page.getByTestId("save-draft-form").click();

    await expect(page.getByTestId("banner-header")).toHaveText("Progress saved");
    await expect(page.getByTestId("banner-body")).toContainText(
      `Changes made to ${CHIP_DRAFT_ID} have been saved.`,
    );
    await expect(page.getByTestId("draft-save-status")).toContainText("Progress saved at");
    await expect(page).toHaveURL(new RegExp(`draftId=${CHIP_DRAFT_ID}`));

    await page.goto(`/details/CHIP%20SPA/${CHIP_DRAFT_ID}?preferDraft=true`);

    await expect(page.getByRole("heading", { name: "Package Activity (1)" })).toBeVisible();
    await expect(page.getByText("Continue Package")).toBeVisible();
    await expect(page.getByText("Delete Package")).toBeVisible();
    await expect(page.getByText("Created By")).toBeVisible();
    await expect(page.getByText("CHIP Eligibility Template")).toBeVisible();
    await expect(page.getByText("Download all attachments")).toBeVisible();

    await page.getByRole("button", { name: "Delete Package" }).click();
    await expect(page.getByText("Confirm delete")).toBeVisible();
    await page.getByRole("button", { name: "Delete" }).click();

    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByTestId("banner-header")).toHaveText("Draft deleted");
    await expect(page.getByTestId("banner-body")).toContainText(
      `Draft for ${CHIP_DRAFT_ID} has been deleted.`,
    );
  });
});
