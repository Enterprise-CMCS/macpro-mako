import pino from "pino";
const logger = pino();

export function getTopic(topicPartition: string) {
  return topicPartition.split("--").pop()?.split("-").slice(0, -1)[0];
}

export enum ErrorType {
  VALIDATION = "validation",
  UNKNOWN = "unknown",
  BULKUPDATE = "bulkupdate",
  BADTOPIC = "badtopic",
  BADPARSE = "badparse",
}

const ErrorMessages = {
  [ErrorType.VALIDATION]: "A validation error occurred.",
  [ErrorType.UNKNOWN]: "An unknown error occurred.",
  [ErrorType.BULKUPDATE]: "An error occurred while bulk updating records.",
  [ErrorType.BADTOPIC]:
    "Topic is unknown, unsupported, or unable to be parsed.",
  [ErrorType.BADPARSE]: "An error occurred while parsing the record.",
};

export const logError = ({
  error,
  type,
  metadata = {},
}: {
  type: ErrorType;
  error?: Error | any;
  metadata?: Record<string, any>;
}): void => {
  logger.error(
    {
      error: error
        ? {
            message: error.message,
            stack: error.stack,
            ...error,
          }
        : {},
      custom: prettyPrintJsonInObject({
        type,
        metadata,
      }),
    },
    ErrorMessages[type]
  );
};

const prettyPrintJsonInObject = (obj: any): any => {
  // Helper function to check if a string is JSON
  const isJsonString = (str: string): boolean => {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Recursive function to traverse and pretty-print JSON strings
  const traverseAndPrettyPrint = (element: any): any => {
    if (element && typeof element === "object") {
      Object.keys(element).forEach((key) => {
        const value = element[key];
        // If the value is an object, recurse into it
        if (typeof value === "object") {
          traverseAndPrettyPrint(value);
        } else if (typeof value === "string" && isJsonString(value)) {
          // Pretty print the JSON string
          element[key] = JSON.stringify(JSON.parse(value), null, 2);
        }
      });
    }
  };

  traverseAndPrettyPrint(obj);
  return obj;
};
