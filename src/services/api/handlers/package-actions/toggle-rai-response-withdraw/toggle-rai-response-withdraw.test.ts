// toggle-rai-response-withdraw.test.ts

import { toggleRaiResponseWithdraw } from "./toggle-rai-response-withdraw";
import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  IssueRaiDto,
  PackageWriteClass,
  RemoveAppkChildDto,
  RespondToRaiDto,
  UpdateIdDto,
  WithdrawPackageDto,
  WithdrawRaiDto,
} from "../services/package-action-write-service";
import { ToggleRaiResponseDto } from "../services/mako-write-service";
import { CompleteIntakeDto } from "../services/seatool-write-service";

class MockPackageActionWriteService implements PackageWriteClass {
  async issueRai(data: IssueRaiDto) {
    console.log("hello");
  }
  async respondToRai(data: RespondToRaiDto) {
    console.log("hello");
  }
  async withdrawRai(data: WithdrawRaiDto) {
    console.log("hello");
  }
  async toggleRaiResponseWithdraw(data: ToggleRaiResponseDto) {
    console.log("hello");
  }
  async removeAppkChild(data: RemoveAppkChildDto) {
    console.log("hello");
  }
  async withdrawPackage(data: WithdrawPackageDto) {
    console.log("hello");
  }
  async updateId(data: UpdateIdDto) {
    console.log("hello");
  }
  async completeIntake(data: CompleteIntakeDto) {
    console.log("hello");
  }
}

describe("toggleRaiResponseWithdraw", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a server error response if given bad body", async () => {
    const mockPackageWrite = new MockPackageActionWriteService();

    const toggleRaiWithdraw = await toggleRaiResponseWithdraw(
      { hello: "world" },
      true,
      mockPackageWrite,
    );
  });
});
