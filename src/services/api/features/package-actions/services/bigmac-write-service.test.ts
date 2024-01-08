import { IKafkaService } from "@/shared/onemac-micro-kafka";
import { BigmacWriteService } from "./bigmac-write-service";
import { vi, expect, describe, it, beforeEach } from "vitest";
import { Action } from "shared-types/actions";
import { generateMock } from "@anatine/zod-mock";
import { raiIssueSchema } from "shared-types";

class MockKafkaService implements IKafkaService {
  async produceMessage(topic: string, key: string, value: string) {
    console.log("sending fake message to kafka with following data", {
      topic,
      key,
      value,
    });
  }
}

let mockKafkaService: MockKafkaService;
let bigmacWriteService: BigmacWriteService;

describe("Test BigMacWriteService Class", async () => {
  beforeEach(() => {
    mockKafkaService = new MockKafkaService();
    bigmacWriteService = new BigmacWriteService(mockKafkaService, "test-topic");
  });

  it("Sends correct message to kafka for enable/disable rai workflow", async () => {
    const kafkaSpy = vi.spyOn(mockKafkaService, "produceMessage");

    await bigmacWriteService.setWithdrawEnabled({
      id: "test",
      authority: "test",
      withdrawEnabled: false,
    });

    expect(kafkaSpy).toHaveBeenCalledWith<
      [topic: string, key: string, value: string]
    >(
      "test-topic",
      "test",
      JSON.stringify({
        raiWithdrawEnabled: false,
        actionType: Action.DISABLE_RAI_WITHDRAW,
        authority: "test",
      })
    );
  });

  it("Sends correct message to kafka for issue rai workflow", async () => {
    const kafkaSpy = vi.spyOn(mockKafkaService, "produceMessage");
    const mockRai = generateMock(raiIssueSchema, {
      seed: 123,
    });

    await bigmacWriteService.issueRai(mockRai);

    expect(kafkaSpy).toHaveBeenCalledWith<
      [topic: string, key: string, value: string]
    >(
      "test-topic",
      mockRai.id,
      JSON.stringify({ ...mockRai, actionType: Action.ISSUE_RAI })
    );
  });
});
