import { test as setup } from "@playwright/test";
import * as Libs from "../../../../libs/secrets-manager-lib";
import { testUsers } from "./users";
import { LoginPage } from "../pages";
import { vi } from "vitest";

const stage =
  process.env.STAGE_NAME === "production" || process.env.STAGE_NAME === "val"
    ? process.env.STAGE_NAME
    : "default";
const secretId = `${process.env.PROJECT}/${stage}/bootstrapUsersPassword`;

const password = (await Libs.getSecretsValue(
  process.env.REGION_A as string,
  secretId
)) as string;

// function ldClientMock(featureFlags) {
//   return {
//     track: vi.fn(),
//     identify: vi.fn(),
//     close: vi.fn(),
//     flush: vi.fn(),
//     getContext: vi.fn(),
//     off: vi.fn(),
//     on: vi.fn(),
//     setStreaming: vi.fn(),
//     variationDetail: vi.fn(),
//     waitForInitialization: vi.fn(),
//     waitUntilGoalsReady: vi.fn(),
//     waitUntilReady: vi.fn(),
//     variation: vi.fn(
//       (flag, defaultValue) => featureFlags[flag] ?? defaultValue
//     ),
//     allFlags: vi.fn(() => featureFlags),
//   };
// }

// const ldProviderConfig = {
//   clientSideID: "test-url",
//   options: {
//     bootstrap: {},
//     baseUrl: "test-url",
//     streamUrl: "test-url",
//     eventsUrl: "test-url",
//   },
//   ldClient: ldClientMock({}),
// };

const mockAsyncWithLDProvider = async () => {
  // Return whatever mocked data you need for testing
  return {
    flags: {}, // Mocked flags
    ldClient: null, // Mocked LD client
    ldProvider: "<div>Mocked LD Provider</div>", // Mocked LD provider
  };
};

vi.mock("launchdarkly-react-client-sdk", () => ({
  asyncWithLDProvider: mockAsyncWithLDProvider,
}));

const stateSubmitterAuthFile = "playwright/.auth/state-user.json";

setup("authenticate state submitter", async ({ page, context }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  await loginPage.login(testUsers.state, "bigTUNA1!");
  await context.storageState({ path: stateSubmitterAuthFile });
});

const reviewerAuthFile = "playwright/.auth/reviewer-user.json";

setup("authenticate cms reviewer", async ({ page, context }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  await loginPage.login(testUsers.reviewer, "bigTUNA1!");
  await context.storageState({ path: reviewerAuthFile });
});
