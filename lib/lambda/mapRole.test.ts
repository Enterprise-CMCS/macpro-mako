import { afterEach, describe, expect, it, vi } from "vitest";
import { handler } from "./mapRole";
import { Context } from "aws-lambda";
import {
  CLOUDFORMATION_NOTIFICATION_DOMAIN,
  OPENSEARCH_DOMAIN,
  errorSecurityRolesMappingHandler,
} from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";
import * as os from "../libs/opensearch-lib";

describe("CloudFormation Custom Resource Handler", () => {
  const mockEventBase = {
    ResponseURL: CLOUDFORMATION_NOTIFICATION_DOMAIN,
    ResourceProperties: {
      OsDomain: OPENSEARCH_DOMAIN,
      MasterRoleToAssume: "master-role",
      OsRoleName: "os-role",
      IamRoleName: "iam-role",
    },
  };
  const mapRoleSpy = vi.spyOn(os, "mapRole");
  const callback = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should call os.mapRole on Create request type", async () => {
    const mockEvent = {
      ...mockEventBase,
      RequestType: "Create",
    };

    await handler(mockEvent, {} as Context, callback);

    expect(mapRoleSpy).toHaveBeenCalledWith(
      mockEvent.ResourceProperties.OsDomain,
      mockEvent.ResourceProperties.MasterRoleToAssume,
      mockEvent.ResourceProperties.OsRoleName,
      mockEvent.ResourceProperties.IamRoleName,
    );
    expect(callback).toHaveBeenCalledWith(null, { statusCode: 200 });
  });

  it("should call os.mapRole on Update request type", async () => {
    const mockEvent = {
      ...mockEventBase,
      RequestType: "Update",
    };

    await handler(mockEvent, {} as Context, callback);

    expect(mapRoleSpy).toHaveBeenCalledWith(
      mockEvent.ResourceProperties.OsDomain,
      mockEvent.ResourceProperties.MasterRoleToAssume,
      mockEvent.ResourceProperties.OsRoleName,
      mockEvent.ResourceProperties.IamRoleName,
    );
    expect(callback).toHaveBeenCalledWith(null, { statusCode: 200 });
  });

  it("should do nothing on Delete request type", async () => {
    const mockEvent = {
      ...mockEventBase,
      RequestType: "Delete",
    };

    await handler(mockEvent, {} as Context, callback);

    expect(mapRoleSpy).not.toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(null, { statusCode: 200 });
  });

  it("should send FAILED status on error", async () => {
    mockedServer.use(errorSecurityRolesMappingHandler);

    const mockEvent = {
      ...mockEventBase,
      RequestType: "Create",
    };

    await handler(mockEvent, {} as Context, callback);
    expect(mapRoleSpy).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(expect.any(Error), { statusCode: 500 });
  });
});
