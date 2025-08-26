import { UTCDate } from "@date-fns/utc";
import { errors as OpensearchErrors } from "@opensearch-project/opensearch";
import { add, differenceInDays, startOfDay } from "date-fns";
import { ItemResult } from "shared-types/opensearch/main";

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

export const addPauseDurationToTimestamp = async (
  parsedRecord: ParseKafkaEvent,
  item: ItemResult,
  timestamp: number,
): Promise<number> => {
  console.log({ parsedRecord });
  if (
    !(
      parsedRecord?.event === "respond-to-rai" &&
      parsedRecord?.authority?.toUpperCase() === "CHIP SPA"
    )
  ) {
    return timestamp;
  }

  const submissionDate = item?._source.submissionDate || "";
  const raiRequestedDate = item?._source.raiRequestedDate || "";
  console.log({ submissionDate, raiRequestedDate });

  if (!submissionDate || !raiRequestedDate) {
    console.error("error parsing os record");
    return timestamp;
  }

  // length of time from when the RAI was requested until now
  const pausedDuration = differenceInDays(
    startOfDay(new UTCDate()), // now
    startOfDay(new UTCDate(raiRequestedDate)), // original RAI Requested Date
  );

  const submissionDateWithPauseDuration = add(new UTCDate(submissionDate), {
    days: pausedDuration,
  });

  return submissionDateWithPauseDuration.getTime();
};
