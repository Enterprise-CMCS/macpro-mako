import { UTCDate } from "@date-fns/utc";
import { errors as OpensearchErrors } from "@opensearch-project/opensearch";
import { add, differenceInDays } from "date-fns";
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

/**
 * Adjusts the timestamp, if needed, to provide the email template with the correct date.
 * For example:
 * - The 90 day date for a respond to RAI events for CHIP SPAs should not be the timestamp
 * the call to the handler, but the submission date plus the number of days between the
 * RAI request and response.
 * @param parsedRecord the Kafka value parsed as a JSON object
 * @param item the OpenSearch item matching the Kafka key
 * @param timestamp the timestamp of the call to the handler
 * @returns the original timestamp, unless the record is a Respond to RAI event for a CHIP SPA.
 */
export const adjustTimestamp = (
  parsedRecord: ParseKafkaEvent,
  item: ItemResult,
  timestamp: number,
): number => {
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

  if (!submissionDate || !raiRequestedDate) {
    console.error("error parsing os record");
    return timestamp;
  }

  // length of time from when the RAI was requested until now
  const pausedDuration = differenceInDays(
    new UTCDate(), // now
    new UTCDate(raiRequestedDate), // original RAI Requested Date
  );

  const submissionDateWithPauseDuration = add(new UTCDate(submissionDate), {
    days: pausedDuration,
  });

  return submissionDateWithPauseDuration.getTime();
};
