import { type Action } from "shared-types";
import { getNextBusinessDayTimestamp } from "shared-utils";
import { produceMessage } from "../../../libs/api/kafka";

export type MessageProducer = (
  topic: string,
  key: string,
  value: string,
) => Promise<void>;

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
  newId: string;
  action: Action;
} & Record<string, unknown>;

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
