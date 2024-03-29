import { Handler } from "aws-lambda";
import { decode } from "base-64";
import * as os from "./../../../libs/opensearch-lib";
import { opensearch } from "shared-types";
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
      try {
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
        if (record?.origin !== "micro") {
          if (
            record?.sk === "Package" && // Is a Package View
            record?.submitterName && // Is originally from Legacy
            record?.submitterName !== "-- --" // Is originally from Legacy
          ) {
            const result = opensearch.main.legacySubmission
              .transform(id)
              .safeParse(record);
            if (!result.success) {
              return console.log(
                "LEGACY Validation Error. The following record failed to parse: ",
                JSON.stringify(record),
                "Because of the following Reason(s):",
                result.error.message,
              );
            }

            ACC.push(result.data);
          }
          return;
        }

        // Handle everything else
        const result = (() => {
          switch (record?.actionType) {
            case undefined:
              return opensearch.main.newSubmission
                .transform(id)
                .safeParse(record);

            case Action.DISABLE_RAI_WITHDRAW:
            case Action.ENABLE_RAI_WITHDRAW:
              return opensearch.main.toggleWithdrawEnabled
                .transform(id)
                .safeParse(record);
            case Action.WITHDRAW_RAI:
              return opensearch.main.withdrawRai
                .transform(id)
                .safeParse(record);
            case Action.WITHDRAW_PACKAGE:
              return opensearch.main.withdrawPackage
                .transform(id)
                .safeParse(record);
            case Action.REMOVE_APPK_CHILD:
              return opensearch.main.removeAppkChild
                .transform(id)
                .safeParse(record);
          }
        })();

        if (!result) return;
        if (!result?.success) {
          return console.log(
            "ONEMAC Validation Error. The following record failed to parse: ",
            JSON.stringify(record),
            "Because of the following Reason(s):",
            result?.error.message,
          );
        }

        ACC.push(result.data);
      } catch (error) {
        console.log("SINK FAILURE:  There was an error sinking a record.");
        console.log("Unedited event key: " + REC.key);
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
      try {
        // Handle deletes and return
        if (!REC.value) return;

        const record = JSON.parse(decode(REC.value));

        // Handle legacy and return
        if (record?.origin !== "micro") return;

        // TODO: remove-appk-child Event??
        if (record?.actionType === Action.REMOVE_APPK_CHILD) {
          return ACC.push({
            ...record,
            appkChildId: record.id,
            timestamp: REC.timestamp,
            id: `${record.appkParentId}-${REC.offset}`,
            packageId: record.appkParentId,
          });
        }

        // Handle everything else
        const packageId = decode(REC.key);
        ACC.push({
          ...record,
          ...(!record?.actionType && { actionType: "new-submission" }), // new-submission custom actionType
          timestamp: REC.timestamp,
          id: `${packageId}-${REC.offset}`,
          packageId,
        });
      } catch (error) {
        console.log("SINK FAILURE:  There was an error sinking a record.");
        console.log("Unedited event key: " + REC.key);
      }
    });

    return ACC;
  }, [] as any[]);

  try {
    await os.bulkUpdateData(osDomain, "changelog", data);
  } catch (error) {
    console.error(error);
  }
};
