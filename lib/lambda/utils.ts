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
  const submissionMS = new Date(submissionDate).getTime();
  const raiMS = new Date(raiRequestedDate).getTime();
  if (!submissionDate || !raiRequestedDate) {
    console.error("error parsing os record");
  }
  const now = Date.now();

  if (raiRequestedDate && submissionDate) {
    // length of time from when the RAI was requested until now
    const pausedDuration = now - raiMS;
    // 90 days in milliseconds
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;

    const ninetyDayExpirationClock = submissionMS + ninetyDays + pausedDuration;
    return ninetyDayExpirationClock;
  }
  return undefined;
};

export const isChipSpaRespondRAIEvent = (parsedRecord: ParseKafkaEvent) => {
  return parsedRecord?.event == "respond-to-rai" && parsedRecord?.authority == "CHIP SPA";
};
