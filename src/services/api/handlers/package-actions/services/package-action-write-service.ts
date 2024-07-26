import { getIdsToUpdate } from "../get-id-to-update";
import {
  IssueRaiDto as MakoIssueRaiDto,
  CompleteIntakeDto as MakoCompleteIntake,
  RespondToRaiDto as MakoRespondToRai,
  WithdrawRaiDto as MakoWithdrawRai,
  ToggleRaiResponseDto,
  RemoveAppkChildDto as MakoRemoveAppkChild,
  WithdrawPackageDto as MakoWithdrawPackage,
  UpdateIdDto as MakoUpdateId,
  completeIntakeMako,
  issueRaiMako,
  respondToRaiMako,
  withdrawPackageMako,
  toggleRaiResponseWithdrawMako,
  removeAppkChildMako,
  updateIdMako,
} from "./mako-write-service";
import {
  IssueRaiDto as SeaIssueRaiDto,
  CompleteIntakeDto as SeaCompleteIntake,
  RespondToRaiDto as SeaRespondToRai,
  WithdrawRaiDto as SeaWithdrawRai,
  RemoveAppkChildDto as SeaRemoveAppkChild,
  WithdrawPackageDto as SeaWithdrawPackage,
  UpdateIdDto as SeaUpdateId,
  getTrx,
  completeIntakeSeatool,
  issueRaiSeatool,
  respondToRaiSeatool,
  withdrawRaiSeatool,
  removeAppkChildSeatool,
  withdrawPackageSeatool,
  updateIdSeatool,
} from "./seatool-write-service";

export type CompleteIntakeDto = MakoCompleteIntake & SeaCompleteIntake;
export type IssueRaiDto = SeaIssueRaiDto & MakoIssueRaiDto;
export type RespondToRaiDto = SeaRespondToRai & MakoRespondToRai;
export type WithdrawRaiDto = SeaWithdrawRai & MakoWithdrawRai;
export type RemoveAppkChildDto = SeaRemoveAppkChild & MakoRemoveAppkChild;
export type WithdrawPackageDto = SeaWithdrawPackage & MakoWithdrawPackage;
export type UpdateIdDto = SeaUpdateId & MakoUpdateId;

export const completeIntakeAction = async ({
  action,
  cpoc,
  description,
  id,
  subTypeIds,
  subject,
  submitterName,
  timestamp,
  topicName,
  typeIds,
  ...data
}: CompleteIntakeDto) => {
  const { trx } = await getTrx();

  try {
    await trx.begin();
    await completeIntakeSeatool({
      typeIds,
      subTypeIds,
      id,
      cpoc,
      description,
      subject,
      submitterName,
    });
    await completeIntakeMako({
      action,
      id,
      timestamp,
      topicName,
      ...data,
    });
    await trx.commit();
  } catch (err: unknown) {
    console.log("AN ERROR OCCURED: ", err);
    trx.rollback();
  }
};

export const issueRaiAction = async ({
  action,
  id,
  spwStatus,
  today,
  timestamp,
  topicName,
  ...data
}: IssueRaiDto) => {
  const { trx } = await getTrx();

  try {
    await trx.begin();
    const idsToUpdate = await getIdsToUpdate(id);

    for (const id of idsToUpdate) {
      await issueRaiSeatool({ id, spwStatus, today });
      await issueRaiMako({
        action,
        id,
        timestamp,
        topicName,
        ...data,
      });
    }

    await trx.commit();
  } catch (err: unknown) {
    await trx.rollback();

    console.error(err);
  }
};

export const respondToRaiAction = async ({
  action,
  id,
  raiReceivedDate,
  raiToRespondTo,
  raiWithdrawnDate,
  responseDate,
  spwStatus,
  today,
  timestamp,
  topicName,
  ...data
}: RespondToRaiDto) => {
  const { trx } = await getTrx();

  try {
    await trx.begin();
    const idsToUpdate = await getIdsToUpdate(id);

    for (const id of idsToUpdate) {
      await respondToRaiSeatool({
        id,
        spwStatus,
        today,
        raiReceivedDate,
        raiToRespondTo,
        raiWithdrawnDate,
      });
      await respondToRaiMako({
        action,
        id,
        topicName,
        timestamp,
        responseDate,
        ...data,
      });
    }

    await trx.commit();
  } catch (err: unknown) {
    await trx.rollback();

    console.error(err);
  }
};

export const withdrawRaiAction = async ({
  id,
  spwStatus,
  today,
  timestamp,
  raiReceivedDate,
  raiToWithdraw,
  raiRequestedDate,
  action,
  topicName,
  withdrawnDate,
  ...data
}: WithdrawRaiDto) => {
  const { trx } = await getTrx();

  try {
    await trx.begin();
    const idsToUpdate = await getIdsToUpdate(id);

    for (const id of idsToUpdate) {
      await withdrawRaiSeatool({
        id,
        spwStatus,
        today,
        raiReceivedDate,
        raiToWithdraw,
        raiRequestedDate,
      });
      await withdrawPackageMako({
        action,
        id,
        topicName,
        timestamp,
        withdrawnDate,
        ...data,
      });
    }

    await trx.commit();
  } catch (err: unknown) {
    await trx.rollback();

    console.error(err);
  }
};

export const toggleRaiResponseWithdrawAction = async (
  data: ToggleRaiResponseDto,
) => {
  try {
    const idsToUpdate = await getIdsToUpdate(data.id);

    for (const id of idsToUpdate) {
      await toggleRaiResponseWithdrawMako({
        ...data,
        id,
      });
    }
  } catch (err: unknown) {
    console.error(err);
  }
};

export const removeAppkChildAction = async ({
  id,
  timestamp,
  today,
  spwStatus,
  action,
  topicName,
  ...data
}: RemoveAppkChildDto) => {
  const { trx } = await getTrx();

  try {
    await trx.begin();
    const idsToUpdate = [id];

    for (const id of idsToUpdate) {
      await removeAppkChildSeatool({
        id,
        spwStatus,
        today,
      });
      await removeAppkChildMako({
        action,
        id,
        topicName,
        timestamp,
        ...data,
      });
    }

    await trx.commit();
  } catch (err: unknown) {
    await trx.rollback();

    console.error(err);
  }
};

export const withdrawPackageAction = async ({
  id,
  timestamp,
  today,
  spwStatus,
  action,
  topicName,
  ...data
}: WithdrawPackageDto) => {
  const { trx } = await getTrx();

  try {
    await trx.begin();
    const idsToUpdate = await getIdsToUpdate(id);

    for (const id of idsToUpdate) {
      await withdrawPackageSeatool({
        id,
        spwStatus,
        today,
      });
      await withdrawPackageMako({
        action,
        id,
        topicName,
        timestamp,
        ...data,
      });
    }
    await trx.commit();
  } catch (err: unknown) {
    await trx.rollback();

    console.error(err);
  }
};

export const updateIdAction = async ({
  id,
  timestamp,
  today,
  spwStatus,
  action,
  topicName,
  newId,
  ...data
}: UpdateIdDto) => {
  const { trx } = await getTrx();

  try {
    await trx.begin();
    const idsToUpdate = [id];

    for (const id of idsToUpdate) {
      await updateIdSeatool({
        id,
        spwStatus,
        today,
        newId,
      });

      await updateIdMako({
        action,
        id,
        newId,
        timestamp,
        topicName,
        ...data,
      });
    }
    await trx.commit();
  } catch (err: unknown) {
    await trx.rollback();

    console.error(err);
  }
};
