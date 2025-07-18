import { errors as OpensearchErrors } from "@opensearch-project/opensearch";
import * as os from "libs/opensearch-lib";
import { getOsNamespace } from "libs/utils";

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

export const calculate90dayExpiration = async (
  parsedRecord: ParseKafkaEvent,
  config: ProcessEmailConfig,
) => {
  const item = await os.getItem(config.osDomain, getOsNamespace("main"), parsedRecord.id);
  const submissionDate = item?._source.submissionDate || "";
  const raiRequestedDate = item?._source.raiRequestedDate || "";
  // seatool calculates this date once an RAI response date is entered, this is the 90 day experiation clock of the first RAI
  const alert90DaysDate = item?._source.alert90DaysDate || "";
  const submissionMS = new Date(submissionDate).getTime();
  const raiMS = new Date(raiRequestedDate).getTime();

  if (!submissionDate || !raiRequestedDate) {
    console.error("error parsing os record");
  }
  const now = Date.now();
  // length of time from when the RAI was requested until now
  const pausedDuration = now - raiMS;
  //first RAI
  if (raiRequestedDate && submissionDate && !alert90DaysDate) {
    // 90 days in milliseconds
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;

    const ninetyDayExpirationClock = submissionMS + ninetyDays + pausedDuration;
    return ninetyDayExpirationClock;

    // one RAI response has already been submitted, paused duration should be added to the first 90 day expiration
  }
  if (raiRequestedDate && submissionDate && alert90DaysDate) {
    console.log("made it inside second if");
    const alert90DaysDateMS = Number(alert90DaysDate);
    console.log("alert90DaysDateMS: ", alert90DaysDateMS)
    const ninetyDayExpirationClock = alert90DaysDateMS + pausedDuration;
    console.log("90 day expiration clock")
    return ninetyDayExpirationClock;
  }
  return undefined;
};

export const isChipSpaRespondRAIEvent = (parsedRecord: ParseKafkaEvent) => {
  return parsedRecord?.event == "respond-to-rai" && parsedRecord?.authority == "CHIP SPA";
};
