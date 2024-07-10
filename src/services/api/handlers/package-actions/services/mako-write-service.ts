import { type Action } from "shared-types";

type MessageProducer = (
  topic: string,
  key: string,
  value: string,
) => Promise<void>;

export type CompleteIntakeDto = {
  topicName: string;
  id: string;
  action: Action;
  timestamp: number;
} & Record<string, unknown>;

export class MakoWriteService {
  #messageProducer: MessageProducer;

  constructor(messageProducer: MessageProducer) {
    this.#messageProducer = messageProducer;
  }

  async completeIntake({
    action,
    id,
    timestamp,
    topicName,
    ...data
  }: CompleteIntakeDto) {
    await this.#messageProducer(
      topicName,
      id,
      JSON.stringify({
        actionType: action,
        timestamp,
        ...data,
      }),
    );
  }
}
