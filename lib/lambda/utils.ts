import { errors as OpensearchErrors } from "@opensearch-project/opensearch";
import { getOsNamespace } from "libs/utils";
import * as os from "libs/opensearch-lib";

export type ErrorResponse = {
  statusCode: number;
  body: {
    message?: string;
  };
};

interface ParseKafkaEvent {
  id: string;
  event?: string;
  authority?: string;
}

export interface ProcessEmailConfig {
  emailAddressLookupSecretName: string;
  applicationEndpointUrl: string;
  osDomain: string;
  indexNamespace?: string;
  region: string;
  DLQ_URL: string;
  userPoolId: string;
  configurationSetName: string;
  isDev: boolean;
}



export const handleOpensearchError = (error: unknown): ErrorResponse => {
  console.error({ error });
  if (error instanceof OpensearchErrors.ResponseError) {
    return {
      statusCode: error.statusCode || error.meta?.statusCode || 500,
      body: {
        message: error.body || error.meta?.body,
      },
    };
  }

  return {
    statusCode: 500,
    body: { message: "Internal server error" },
  };
};

export const calculate90dayExpiration = async (parsedRecord: ParseKafkaEvent, config: ProcessEmailConfig) => {
  let ninetyDayExpirationClock;
  console.log("respond to rai event for package: ", parsedRecord.id);
  const item = await os.getItem(config.osDomain, getOsNamespace("main"), parsedRecord.id);
  // const item = await os.getItem(getDomain(), getOsNamespace("main"), parsedResult.data.id);
  // const osRecord = await getPackage(parsedRecord.id);
  console.log("returned open search record: ", item);
  // if (!item?.found || !item?._source) {
  const submissionDate = item?._source.submissionDate || "";
  console.log("submission date: ", submissionDate);
  const raiRequestedDate = item?._source.raiRequestedDate || "";
  console.log("raiRequestedDate: ", raiRequestedDate);
  const alert90DaysDate = item?._source.alert90daysDate || "";
  console.log("alert90DaysDate: ", alert90DaysDate);
  const submissionMS = new Date(submissionDate).getTime();
  const raiMS = new Date(raiRequestedDate).getTime();
  if (!submissionDate || !raiRequestedDate) {
    console.error("error parsing os record")
  }
  const now = Date.now();

  if (raiRequestedDate) {
    const pausedDuration = now - raiMS;

    // 90 days in milliseconds
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;

    // The due date = submission timestamp + 90 days + the paused duration

    if (!alert90DaysDate) {
      ninetyDayExpirationClock = submissionMS + ninetyDays + pausedDuration;
    } else {
      // for scenarios where there are multiple RAI's use the previous 90day exp clock and add the most recent paused duration
      console.log("alert 90 days date found");
      ninetyDayExpirationClock = alert90DaysDate + pausedDuration
    }
    console.log("ninety day expiration: ", ninetyDayExpirationClock);
    console.log("ninety day formatted: ", new Date(ninetyDayExpirationClock));
  }
  return ninetyDayExpirationClock;
};

export const isChipSpaRespondRAIEvent = (parsedRecord: ParseKafkaEvent) => {
  return parsedRecord?.event == "respond-to-rai" && parsedRecord?.authority == "CHIP SPA";
}