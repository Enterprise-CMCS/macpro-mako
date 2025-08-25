import { UTCDate } from "@date-fns/utc";
import { errors as OpensearchErrors } from "@opensearch-project/opensearch";
import { add, differenceInDays, startOfDay } from "date-fns";
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
): Promise<number | undefined> => {
  if (
    !(
      parsedRecord?.event === "respond-to-rai" &&
      parsedRecord?.authority?.toUpperCase() === "CHIP SPA"
    )
  ) {
    return undefined;
  }

  const item = await os.getItem(config.osDomain, getOsNamespace("main"), parsedRecord.id);
  const submissionDate = item?._source.submissionDate || "";
  const raiRequestedDate = item?._source.raiRequestedDate || "";

  if (!submissionDate || !raiRequestedDate) {
    return undefined;
  }

  // length of time from when the RAI was requested until now
  const pausedDuration = differenceInDays(
    startOfDay(new UTCDate()), // now
    new UTCDate(raiRequestedDate), // original RAI Requested Date
  );

  const ninetyDayExpirationClock = add(new UTCDate(submissionDate), {
    days: 90 + pausedDuration,
  });
  return ninetyDayExpirationClock.getTime();
};

export const isChipSpaRespondRAIEvent = (parsedRecord: ParseKafkaEvent) => {
  return (
    parsedRecord?.event == "respond-to-rai" && parsedRecord?.authority?.toUpperCase() == "CHIP SPA"
  );
};
