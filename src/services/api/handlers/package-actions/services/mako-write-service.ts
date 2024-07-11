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

export type IssueRaiDto = {
  topicName: string;
  id: string;
  action: Action;
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

  async issueRai({ action, id, topicName, ...data }: IssueRaiDto) {
    await this.#messageProducer(
      topicName,
      id,
      JSON.stringify({
        ...data,
        id,
        actionType: action,
      }),
    );
  }
}
