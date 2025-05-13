import { UserRoleEmailType } from "lib/libs/email/content";
import { getUserRoleTemplate } from "libs/email";
import { getSecret } from "shared-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { sendUserRoleEmails } from "./processEmails";
import { getApproversByRoleState, getUserByEmail } from "./user-management/userManagementService";

vi.mock("libs/email", async () => {
  const actual = await vi.importActual<typeof import("libs/email")>("libs/email");
  return {
    ...actual,
    getUserRoleTemplate: vi.fn().mockResolvedValue(() => ({
      subject: "Mock subject",
      body: "Mock body",
      to: "recipient",
      from: "sender",
    })),
  };
});

vi.mock("shared-utils", () => ({
  getSecret: vi.fn(),
}));

vi.mock("./user-management/userManagementService", () => ({
  getUserByEmail: vi.fn(),
  getApproversByRoleState: vi.fn(),
}));

const baseValue: UserRoleEmailType = {
  status: "pending",
  territory: "VA",
  fullName: "Mock Name",
  email: "mock@email.com",
  doneBy: "done by",
  doneByEmail: "doneby@email.com",
  applicationEndpointUrl: "https://app.url",
  approverList: [],
  // @ts-ignore
  role: "statesubmitter",
};

const baseConfig = {
  applicationEndpointUrl: "https://app.url",
  osDomain: "test.domain.com",
  indexNamespace: "test-",
  emailAddressLookupSecretName: "email-secret",
  DLQ_URL: "",
  isDev: false,
  region: "us-east-2",
  userPoolId: "1",
  configurationSetName: "set-name",
};

const mockTemplateFn = vi.fn().mockResolvedValue({ subject: "Hello", body: "Body" });

describe("process user role emails", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (getUserRoleTemplate as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockTemplateFn);
    (getUserByEmail as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      fullName: "Test User",
    });
    (getApproversByRoleState as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      { email: "approver1@example.com", fullName: "Approver One" },
    ]);
    (getSecret as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      JSON.stringify({ sourceEmail: "source@example.com" }),
    );
  });

  it("sends AccessPendingNotice and AdminPendingNotice emails if status is pending", async () => {
    await sendUserRoleEmails({ ...baseValue, status: "pending" }, 1234567890, baseConfig);

    expect(getUserRoleTemplate).toHaveBeenCalledWith("AccessPendingNotice");
    expect(getUserRoleTemplate).toHaveBeenCalledWith("AdminPendingNotice");
  });

  it("sends SelfRevokeAdminChangeEmail if user self-revokes", async () => {
    await sendUserRoleEmails(
      { ...baseValue, status: "denied", doneByEmail: baseValue.email },
      1234567890,
      baseConfig,
    );

    expect(getUserRoleTemplate).toHaveBeenCalledWith("SelfRevokeAdminChangeEmail");
  });

  it("sends AccessChangeNotice if status is neither pending nor self-revoked", async () => {
    await sendUserRoleEmails({ ...baseValue, status: "active" }, 1234567890, baseConfig);
    expect(getUserRoleTemplate).toHaveBeenCalledWith("AccessChangeNotice");
  });

  it("logs error if getUserByEmail fails but continues", async () => {
    (getUserByEmail as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("User lookup failed"),
    );

    await sendUserRoleEmails({ ...baseValue, status: "active" }, 1234567890, baseConfig);
  });
});
