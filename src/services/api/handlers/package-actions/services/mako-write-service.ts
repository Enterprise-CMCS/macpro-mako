import { type Action } from "shared-types";
import { getNextBusinessDayTimestamp } from "shared-utils";

export type MessageProducer = (
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

export type RespondToRaiDto = {
  topicName: string;
  id: string;
  action: Action;
  responseDate: number;
} & Record<string, unknown>;

export type ToggleRaiResponseDto = {
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

  async respondToRai({
    action,
    id,
    responseDate,
    topicName,
    ...data
  }: RespondToRaiDto) {
    await this.#messageProducer(
      topicName,
      id,
      JSON.stringify({
        ...data,
        id,
        responseDate,
        actionType: action,
        notificationMetadata: {
          submissionDate: getNextBusinessDayTimestamp(),
        },
      }),
    );
  }
  async toggleRaiResponseWithdraw({
    action,
    id,
    topicName,
    ...data
  }: ToggleRaiResponseDto) {
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
