import { IKafkaService, KafkaService } from "@/shared/onemac-micro-kafka";
import { Action, raiIssueSchema } from "shared-types";
import { z } from "zod";
import { APIError } from "./error-handle-service";

export type KafkaMessage = {
  key: string;
  value: string;
};

export type WithdrawEnabledParams = {
  id: string;
  withdrawEnabled: boolean;
  authority: string;
};

export type IBigmacWriteService = {
  issueRai: (raiData: z.infer<typeof raiIssueSchema>) => Promise<void>;
  setWithdrawEnabled: (params: WithdrawEnabledParams) => Promise<void>;
};

export class BigmacWriteService implements IBigmacWriteService {
  private readonly bigmac: IKafkaService;
  private readonly topic: string;

  constructor(bigmac: IKafkaService, topic: string) {
    this.bigmac = bigmac;
    this.topic = topic;
  }

  private async handleKafkaMessage(message: KafkaMessage) {
    try {
      await this.bigmac.produceMessage(this.topic, message.key, message.value);
    } catch (error: unknown) {
      console.error(error);

      throw new APIError("Failed to write to BigMac");
    }
  }

  async issueRai(raiData: z.infer<typeof raiIssueSchema>) {
    await this.handleKafkaMessage({
      key: raiData.id,
      value: JSON.stringify({ ...raiData, actionType: Action.ISSUE_RAI }),
    });
  }

  async setWithdrawEnabled({
    authority,
    id,
    withdrawEnabled,
  }: WithdrawEnabledParams) {
    await this.handleKafkaMessage({
      key: id,
      value: JSON.stringify({
        raiWithdrawEnabled: withdrawEnabled,
        actionType: withdrawEnabled
          ? Action.ENABLE_RAI_WITHDRAW
          : Action.DISABLE_RAI_WITHDRAW,
        authority,
      }),
    });
  }
}
