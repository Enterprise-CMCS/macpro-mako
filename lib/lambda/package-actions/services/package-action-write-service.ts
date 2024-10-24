import { getIdsToUpdate } from "../get-id-to-update";
import {
  RespondToRaiDto as MakoRespondToRai,
  WithdrawRaiDto as MakoWithdrawRai,
  ToggleRaiResponseDto,
  RemoveAppkChildDto as MakoRemoveAppkChild,
  WithdrawPackageDto as MakoWithdrawPackage,
  UpdateIdDto as MakoUpdateId,
  respondToRaiMako,
  withdrawPackageMako,
  toggleRaiResponseWithdrawMako,
  removeAppkChildMako,
  updateIdMako,
} from "./mako-write-service";
import {
  RespondToRaiDto as SeaRespondToRai,
  WithdrawRaiDto as SeaWithdrawRai,
  RemoveAppkChildDto as SeaRemoveAppkChild,
  WithdrawPackageDto as SeaWithdrawPackage,
  UpdateIdDto as SeaUpdateId,
  getTrx,
  respondToRaiSeatool,
  withdrawRaiSeatool,
  removeAppkChildSeatool,
  withdrawPackageSeatool,
  updateIdSeatool,
} from "./seatool-write-service";

export type RespondToRaiDto = SeaRespondToRai & MakoRespondToRai;
export type WithdrawRaiDto = SeaWithdrawRai & MakoWithdrawRai;
export type RemoveAppkChildDto = SeaRemoveAppkChild & MakoRemoveAppkChild;
export type WithdrawPackageDto = SeaWithdrawPackage & MakoWithdrawPackage;
export type UpdateIdDto = SeaUpdateId & MakoUpdateId;

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
