import {
  errorApiSubmitRoleRequestsHandler,
  helpDeskUser,
  multiStateSubmitter,
  noStateSubmitter,
  osStateSystemAdmin,
  setMockUsername,
} from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";
import { describe, expect, it } from "vitest";

import { submitRoleRequests } from "./useSubmitRoleRequests";

describe("useSubmitRoleRequests", () => {
  it("should throw an error if the user is not logged in", async () => {
    setMockUsername(null);

    await expect(() =>
      submitRoleRequests({
        email: "nostate@example.com",
        state: "MD",
        role: "statesubmitter",
        eventType: "user-role",
        requestRoleChange: true,
        grantAccess: false,
      }),
    ).rejects.toThrowError("Failed to submit role request");
  });

  it("should throw an error if the user does not have an active role", async () => {
    setMockUsername(noStateSubmitter);

    await expect(() =>
      submitRoleRequests({
        email: "nostate@example.com",
        state: "MD",
        role: "statesubmitter",
        eventType: "user-role",
        requestRoleChange: true,
        grantAccess: false,
      }),
    ).rejects.toThrowError("Failed to submit role request");
  });

  it("should throw an error if the current user cannot request updates", async () => {
    setMockUsername(helpDeskUser);

    await expect(() =>
      submitRoleRequests({
        email: "helpdesk@example.com",
        state: "MD",
        role: "defaultcmsuser",
        eventType: "user-role",
        requestRoleChange: true,
        grantAccess: false,
      }),
    ).rejects.toThrowError("Failed to submit role request");
  });

  it("should throw an error if there is an error", async () => {
    mockedServer.use(errorApiSubmitRoleRequestsHandler);
    setMockUsername(multiStateSubmitter);

    await expect(() =>
      submitRoleRequests({
        email: "multistate@example.com",
        state: "CO",
        role: "statesubmitter",
        eventType: "user-role",
        requestRoleChange: true,
        grantAccess: false,
      }),
    ).rejects.toThrowError("Failed to submit role request");
  });

  it("should throw an error if grantAccess is missing and it's not a request", async () => {
    setMockUsername(osStateSystemAdmin);

    await expect(() =>
      submitRoleRequests({
        email: "nostate@example.com",
        state: "MD",
        role: "statesubmitter",
        eventType: "user-role",
        requestRoleChange: false,
      }),
    );
  });

  it("should return a success message if the user is allowed to update the access", async () => {
    setMockUsername(osStateSystemAdmin);

    const result = await submitRoleRequests({
      email: "nostate@example.com",
      state: "MD",
      role: "statesubmitter",
      eventType: "user-role",
      requestRoleChange: false,
      grantAccess: true,
    });
    expect(result).toEqual({ message: "Request to access MD has been submitted." });
  });

  it("should return a success message if the user is allowed to request access", async () => {
    setMockUsername(multiStateSubmitter);

    const result = await submitRoleRequests({
      email: "multistate@example.com",
      state: "CO",
      role: "statesubmitter",
      eventType: "user-role",
      grantAccess: true,
      requestRoleChange: true,
    });
    expect(result).toEqual({ message: "Request to access CO has been submitted." });
  });
});
