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

export const onemac_main = async (event: KafkaEvent) => {
  const records = Object.values(event.records).reduce((ACC, RECORDS) => {
    RECORDS.forEach((REC) => {
      const id: string = decode(REC.key);

      // Handle deletes and return
      if (!REC.value) {
        ACC.push({
          id,
          additionalInformation: null,
          raiWithdrawEnabled: null,
          attachments: null,
          submitterEmail: null,
          submitterName: null,
        });
        return;
      }

      const record = JSON.parse(decode(REC.value));

      // Handle legacy and return
      if (
        record?.origin !== "micro" && // Is Legacy
        record?.sk === "Package" && // Is a Package View
        record?.submitterName && // Is originally from Legacy
        record?.submitterName !== "-- --" // Is originally from Legacy
      ) {
        const result = main.transforms
          .transformOnemacLegacy(id)
          .safeParse(record);
        if (result.success) {
          ACC.push(result.data);
        } else {
          console.log(
            "LEGACY Validation Error. The following record failed to parse: ",
            JSON.stringify(record),
            "Because of the following Reason(s):",
            result.error.message
          );
        }
        return;
      }

      // Handle everything else
      const result = (() => {
        switch (record?.actionType) {
          case undefined:
            return main.transforms.transformOnemac(id).safeParse(record);
          case Action.DISABLE_RAI_WITHDRAW:
          case Action.ENABLE_RAI_WITHDRAW:
            return main.transforms
              .transformToggleWithdrawRaiEnabled(id)
              .safeParse(record);
          case Action.WITHDRAW_RAI:
            return main.transforms.transformRaiWithdraw(id).safeParse(record);
          case Action.WITHDRAW_PACKAGE:
            return main.transforms
              .transformWithdrawPackage(id)
              .safeParse(record);
        }
      })();
      if (result) {
        if (result?.success) {
          ACC.push(result.data);
        } else {
          console.log(
            "ONEMAC Validation Error. The following record failed to parse: ",
            JSON.stringify(record),
            "Because of the following Reason(s):",
            result?.error.message
          );
        }
      }
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
      // Handle deletes and return
      if (!REC.value) return;

      const record = JSON.parse(decode(REC.value));

      // Handle legacy and return
      if (record?.origin !== "micro") return;

      // Handle everything else
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
