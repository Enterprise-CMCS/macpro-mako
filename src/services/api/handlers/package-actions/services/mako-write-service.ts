import { type Action } from "shared-types";
import { getNextBusinessDayTimestamp } from "shared-utils";
import { produceMessage } from "../../../libs/kafka";

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

export type WithdrawRaiDto = {
  topicName: string;
  id: string;
  action: Action;
} & Record<string, unknown>;

export type RemoveAppkChildDto = {
  topicName: string;
  id: string;
  action: Action;
} & Record<string, unknown>;

export type WithdrawPackageDto = {
  topicName: string;
  id: string;
  action: Action;
} & Record<string, unknown>;

export type UpdateIdDto = {
  topicName: string;
  id: string;
  action: Action;
} & Record<string, unknown>;

export const completeIntakeMako = async ({
  action,
  id,
  timestamp,
  topicName,
  ...data
}: CompleteIntakeDto) =>
  produceMessage(
    topicName,
    id,
    JSON.stringify({
      actionType: action,
      timestamp,
      ...data,
    }),
  );

export const issueRaiMako = async ({
  action,
  id,
  topicName,
  ...data
}: IssueRaiDto) =>
  produceMessage(
    topicName,
    id,
    JSON.stringify({
      ...data,
      id,
      actionType: action,
    }),
  );

export const respondToRaiMako = async ({
  action,
  id,
  responseDate,
  topicName,
  ...data
}: RespondToRaiDto) =>
  produceMessage(
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

export const withdrawRaiMako = async ({
  action,
  id,
  topicName,
  ...data
}: WithdrawRaiDto) =>
  produceMessage(
    topicName,
    id,
    JSON.stringify({
      ...data,
      id,
      actionType: action,
      notificationMetadata: {
        submissionDate: getNextBusinessDayTimestamp(),
      },
    }),
  );

export const toggleRaiResponseWithdrawMako = async ({
  action,
  id,
  topicName,
  ...data
}: ToggleRaiResponseDto) =>
  produceMessage(
    topicName,
    id,
    JSON.stringify({
      ...data,
      id,
      actionType: action,
    }),
  );

export const removeAppkChildMako = async ({
  action,
  id,
  topicName,
  ...data
}: RemoveAppkChildDto) =>
  produceMessage(
    topicName,
    id,
    JSON.stringify({
      ...data,
      id,
      actionType: action,
    }),
  );

export const withdrawPackageMako = async ({
  action,
  id,
  topicName,
  ...data
}: WithdrawPackageDto) =>
  produceMessage(
    topicName,
    id,
    JSON.stringify({
      ...data,
      id,
      actionType: action,
    }),
  );

export const updateIdMako = async ({
  action,
  id,
  topicName,
  ...data
}: UpdateIdDto) =>
  produceMessage(
    topicName,
    id,
    JSON.stringify({
      ...data,
      id,
      actionType: action,
    }),
  );
