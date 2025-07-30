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
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const UTC_ADJUSTMENT = 4 * 60 * 60 * 1000;
  const item = await os.getItem(config.osDomain, getOsNamespace("main"), parsedRecord.id);
  const submissionDate = item?._source.submissionDate || "";
  const submissionDateIsoString = toStartOfUTCDayISOString(submissionDate);
  console.log("submissionDateIsoString: ", submissionDateIsoString)
  const raiRequestedDate = item?._source.raiRequestedDate || "";
  // seatool calculates this date once an RAI response date is entered, this is the 90 day experiation clock of the first RAI
  const alert90DaysDate = item?._source.alert90DaysDate || "";
  const submissionMS = new Date(submissionDateIsoString).getTime();
  const raiMS = new Date(raiRequestedDate).getTime();

  if (!submissionDate || !raiRequestedDate) {
    console.error("error parsing os record");
  }
  const now = getTodayMidnightUTCMillis();
  console.log("now milliseconds: ", now);
  // length of time from when the RAI was requested until now
  const pausedDuration = now - raiMS;
  //first RAI
  if (raiRequestedDate && submissionDate && !alert90DaysDate) {
    // 90 days in milliseconds

    const ninetyDays = 90 * MS_PER_DAY;

    let ninetyDayExpirationClock = submissionMS + ninetyDays + pausedDuration;

    const afterHolidayAdjustment = adjustForHolidays(ninetyDayExpirationClock);
    return adjustToNextMondayIfWeekend(afterHolidayAdjustment);


    // one RAI response has already been submitted, paused duration should be added to the first 90 day expiration
  }
  if (raiRequestedDate && submissionDate && alert90DaysDate) {
    console.log("made it inside second if");
    const alert90DaysDateMS = Number(alert90DaysDate);
    console.log("alert90DaysDateMS: ", alert90DaysDateMS)
    let ninetyDayExpirationClock = alert90DaysDateMS + pausedDuration;
    const afterHolidayAdjustment = adjustForHolidays(ninetyDayExpirationClock);
    return adjustToNextMondayIfWeekend(afterHolidayAdjustment);

  }
  return undefined;
};

export const isChipSpaRespondRAIEvent = (parsedRecord: ParseKafkaEvent) => {
  return parsedRecord?.event == "respond-to-rai" && parsedRecord?.authority == "CHIP SPA";
};

const toStartOfUTCDayISOString = (dateString: string): string => {
  const date = new Date(dateString);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())).toISOString();
};

const getTodayMidnightUTCMillis = (): number => {
  const now = new Date();
  const midnightUTC = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  return midnightUTC;
};


const adjustToNextMondayIfWeekend = (timestamp: number): number => {
  const date = new Date(timestamp);
  const day = date.getUTCDay(); // 0 = Sunday, 6 = Saturday

  let daysToAdd = 0;

  if (day === 6) {
    // Saturday → add 2 days
    daysToAdd = 2;
  } else if (day === 0) {
    // Sunday → add 1 day
    daysToAdd = 1;
  }

  if (daysToAdd === 0) return timestamp;

  const nextMonday = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + daysToAdd
  ));

  const returnDate = nextMonday.getTime()

  return returnDate; // returns timestamp for Monday 00:00:00 UTC
};


const adjustForHolidays = (timestamp: number): number => {
  const date = new Date(timestamp);
  const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD

  if (!holidays.includes(dateStr)) {
    return timestamp;
  }

  // Add 1 day and check again
  const nextDay = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + 1
  ));
  return adjustForHolidays(nextDay.getTime());
};



const holidays = [
  // 2024
  '2024-01-01', // New Year's Day
  '2024-01-15', // MLK Day
  '2024-02-19', // Presidents Day
  '2024-05-27', // Memorial Day
  '2024-07-04', // Independence Day
  '2024-09-02', // Labor Day
  '2024-10-14', // Columbus Day
  '2024-11-11', // Veterans Day
  '2024-11-28', // Thanksgiving
  '2024-12-25', // Christmas

  // 2025
  '2025-01-01', // New Year's Day
  '2025-01-20', // MLK Day
  '2025-02-17', // Presidents Day
  '2025-05-26', // Memorial Day
  '2025-07-04', // Independence Day
  '2025-09-01', // Labor Day
  '2025-10-13', // Columbus Day
  '2025-11-11', // Veterans Day
  '2025-11-27', // Thanksgiving
  '2025-12-25', // Christmas

  // 2026
  '2026-01-01', // New Year's Day
  '2026-01-19', // MLK Day
  '2026-02-16', // Presidents Day
  '2026-05-25', // Memorial Day
  '2026-07-04', // Independence Day
  '2026-09-07', // Labor Day
  '2026-10-12', // Columbus Day
  '2026-11-11', // Veterans Day
  '2026-11-26', // Thanksgiving
  '2026-12-25', // Christmas
];
