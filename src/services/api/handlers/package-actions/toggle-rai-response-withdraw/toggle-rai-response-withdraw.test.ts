// toggle-rai-response-withdraw.test.ts

import { toggleRaiResponseWithdraw } from "./toggle-rai-response-withdraw";
import { ToggleWithdrawRaiEnabled, Action } from "shared-types";
import { response } from "../../../libs/handler";
import { TOPIC_NAME } from "../consts";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { PackageWriteClass } from "../services/package-action-write-service";
import { ToggleRaiResponseDto } from "../services/mako-write-service";
import { CompleteIntakeDto, IssueRaiDto, RespondToRaiDto, WithdrawRaiDto, RemoveAppkChildDto, WithdrawPackageDto, UpdateIdDto } from "../services/seatool-write-service";

class MockPackageActionWriteService implements PackageWriteClass {
  completeIntake: (data: { topicName: string; id: string; action: Action; timestamp: number; } & Record<string, unknown> & CompleteIntakeDto) => {
    
  };
  issueRai: (data: IssueRaiDto & { topicName: string; id: string; action: Action; } & Record<string, unknown>) => Promise<void>;
  respondToRai: (data: RespondToRaiDto & { topicName: string; id: string; action: Action; responseDate: number; } & Record<string, unknown>) => Promise<...>;
  withdrawRai: (data: WithdrawRaiDto & { topicName: string; id: string; action: Action; } & Record<string, unknown>) => Promise<void>;
  toggleRaiResponseWithdraw: (data: ToggleRaiResponseDto) => Promise<void>;
  removeAppkChild: (data: RemoveAppkChildDto & { topicName: string; id: string; action: Action; } & Record<string, unknown>) => Promise<void>;
  withdrawPackage: (data: WithdrawPackageDto & { topicName: string; id: string; action: Action; } & Record<string, unknown>) => Promise<void>;
  updateId: (data: UpdateIdDto & { topicName: string; id: string; action: Action; } & Record<string, unknown>) => Promise<void>;
}

describe("toggleRaiResponseWithdraw", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a server error response if service throws an error", async () => {
    mockPackageActionWriteService.toggleRaiResponseWithdraw.mockRejectedValueOnce(
      new Error("Service Error"),
    );

    const result = await toggleRaiResponseWithdraw(
      body,
      true,
      mockPackageActionWriteService,
    );

    expect(response).toHaveBeenCalledWith({
      statusCode: 500,
    });
  });
});
