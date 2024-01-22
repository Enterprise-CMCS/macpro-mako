import { Handler } from "aws-lambda";
import { decode } from "base-64";
import * as os from "./../../../libs/opensearch-lib";
import * as main from "shared-types/opensearch/main";
import { Action } from "shared-types";
import { KafkaEvent } from "shared-types";

const osDomain: string =
  process.env.osDomain ||
  (() => {
    throw new Error("ERROR: process.env.osDomain is required");
  })();

export const handler: Handler<KafkaEvent> = async (event) => {
  await onemac_main(event);
  await onemac_changelog(event);
};

export const onemacDataTransform = (props: { key: string; value?: string }) => {
  const id: string = decode(props.key);

  // is delete
  if (!props.value) {
    return {
      id,
      additionalInformation: null,
      raiWithdrawEnabled: null,
      attachments: null,
      submitterEmail: null,
      submitterName: null,
    };
  }

  const record = { id, ...JSON.parse(decode(props.value)) };

  // is Legacy
  const isLegacy = record?.origin !== "micro";
  if (isLegacy) {
    const notPackageView = record?.sk !== "Package";
    if (notPackageView) return null;

    const notOriginatingFromOnemacLegacy =
      !record.submitterName || record.submitterName === "-- --";
    if (notOriginatingFromOnemacLegacy) return null;

    const result = main.transforms.transformOnemacLegacy(id).safeParse(record);
    return result.success ? result.data : null;
  }

  // NOTE: Make official decision on initial type by MVP - timebomb
  const isNewRecord = !record?.actionType;
  if (isNewRecord) {
    const result = main.transforms.transformOnemac(id).safeParse(record);
    return result.success ? result.data : null;
  }

  // --------- Package-Actions ---------//

  if (
    record.actionType === Action.DISABLE_RAI_WITHDRAW ||
    record.actionType === Action.ENABLE_RAI_WITHDRAW
  ) {
    const result = main.transforms
      .transformToggleWithdrawRaiEnabled(id)
      .safeParse(record);
    return result.success ? result.data : null;
  }

  if (record.actionType === Action.WITHDRAW_RAI) {
    const result = main.transforms.transformRaiWithdraw(id).safeParse(record);
    return result.success ? result.data : null;
  }

  if (record.actionType === Action.WITHDRAW_PACKAGE) {
    const result = main.transforms
      .transformWithdrawPackage(id)
      .safeParse(record);
    return result.success ? result.data : null;
  }

  return null;
};

export const onemac_main = async (event: KafkaEvent) => {
  const records = Object.values(event.records).reduce((ACC, RECORDS) => {
    RECORDS.forEach((REC) => {
      const dataTransform = onemacDataTransform(REC);
      if (!dataTransform) return;
      ACC.push(dataTransform);
    });

    return ACC;
  }, [] as any[]);

  try {
    await os.bulkUpdateData(osDomain, "main", records);
  } catch (error) {
    console.error(error);
  }
};

export const onemac_changelog = async (event: KafkaEvent) => {
  const data = Object.values(event.records).reduce((ACC, RECORDS) => {
    RECORDS.forEach((REC) => {
      // omit delete event
      if (!REC.value) return;

      const record = JSON.parse(decode(REC.value));
      // omit legacy record
      if (record?.origin !== "micro") return;

      // include package actions
      const packageId = decode(REC.key);
      ACC.push({
        ...record,
        ...(!record?.actionType && { actionType: "new-submission" }), // new-submission custom actionType
        timestamp: REC.timestamp,
        id: `${packageId}-${REC.offset}`,
        packageId,
      });
    });

    return ACC;
  }, [] as any[]);

  try {
    await os.bulkUpdateData(osDomain, "changelog", data);
  } catch (error) {
    console.error(error);
  }
};
