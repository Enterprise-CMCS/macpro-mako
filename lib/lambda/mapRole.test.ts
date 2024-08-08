import { describe, it, expect, vi, beforeEach } from "vitest";
import { send, SUCCESS, FAILED } from "cfn-response-async";
import { handler } from "./mapRole";
import * as os from "../libs/opensearch-lib";

vi.mock("cfn-response-async", () => ({
  send: vi.fn(),
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
}));

vi.mock("../libs/opensearch-lib", () => ({
  mapRole: vi.fn(),
}));

describe("CloudFormation Custom Resource Handler", () => {
  const mockContext = {};
  const mockEventBase = {
    ResourceProperties: {
      OsDomain: "test-domain",
      MasterRoleToAssume: "master-role",
      OsRoleName: "os-role",
      IamRoleName: "iam-role",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call os.mapRole on Create request type", async () => {
    const mockEvent = {
      ...mockEventBase,
      RequestType: "Create",
    };

    (os.mapRole as vi.Mock).mockResolvedValueOnce("Role mapped successfully");

    await handler(mockEvent, mockContext);

    expect(os.mapRole).toHaveBeenCalledWith(
      mockEvent.ResourceProperties.OsDomain,
      mockEvent.ResourceProperties.MasterRoleToAssume,
      mockEvent.ResourceProperties.OsRoleName,
      mockEvent.ResourceProperties.IamRoleName,
    );
    expect(send).toHaveBeenCalledWith(
      mockEvent,
      mockContext,
      SUCCESS,
      {},
      "static",
    );
  });

  it("should call os.mapRole on Update request type", async () => {
    const mockEvent = {
      ...mockEventBase,
      RequestType: "Update",
    };

    (os.mapRole as vi.Mock).mockResolvedValueOnce("Role mapped successfully");

    await handler(mockEvent, mockContext);

    expect(os.mapRole).toHaveBeenCalledWith(
      mockEvent.ResourceProperties.OsDomain,
      mockEvent.ResourceProperties.MasterRoleToAssume,
      mockEvent.ResourceProperties.OsRoleName,
      mockEvent.ResourceProperties.IamRoleName,
    );
    expect(send).toHaveBeenCalledWith(
      mockEvent,
      mockContext,
      SUCCESS,
      {},
      "static",
    );
  });

  it("should do nothing on Delete request type", async () => {
    const mockEvent = {
      ...mockEventBase,
      RequestType: "Delete",
    };

    await handler(mockEvent, mockContext);

    expect(os.mapRole).not.toHaveBeenCalled();
    expect(send).toHaveBeenCalledWith(
      mockEvent,
      mockContext,
      SUCCESS,
      {},
      "static",
    );
  });

  it("should send FAILED status on error", async () => {
    const mockEvent = {
      ...mockEventBase,
      RequestType: "Create",
    };

    (os.mapRole as vi.Mock).mockRejectedValueOnce(new Error("Test error"));

    await handler(mockEvent, mockContext);

    expect(send).toHaveBeenCalledWith(
      mockEvent,
      mockContext,
      FAILED,
      {},
      "static",
    );
  });
});
