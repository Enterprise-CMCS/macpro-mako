import { test as setup } from "@playwright/test";

import {
  loginDeployedStateSubmitter,
  setMockUserEnv,
  writeDeployedStorageState,
  writeMockedStorageState,
} from "../../lib/auth";
import { installThirdPartyStubs } from "../../fixtures/third-party";

const isDeployed =
  process.env.E2E_TIER === "deployed" ||
  (!!process.env.E2E_BASE_URL && process.env.E2E_TIER !== "mocked");

setup("authenticate state submitter", async ({ page }) => {
  if (!isDeployed) {
    setMockUserEnv("state-submitter");
    await writeMockedStorageState("state-submitter");
    await writeMockedStorageState("cms-reviewer");
    return;
  }

  await installThirdPartyStubs(page);
  const stage = process.env.STAGE_NAME || "main";
  await loginDeployedStateSubmitter(page, stage);
  await writeDeployedStorageState(page, "state-submitter");
});
