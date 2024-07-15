import { decodeBase64WithUtf8 } from "shared-utils";

interface EncodedRecord {
  key: string;
  value: string;
}

interface DecodedRecord {
  id: string;
  [key: string]: any;
}

interface Event {
  eventSource?: string;
  records: Record<string, EncodedRecord[]>;
}

interface LambdaResponse {
  statusCode: number;
  body: string | null;
  headers: {
    "Access-Control-Allow-Origin": string;
    "Access-Control-Allow-Credentials": boolean;
  };
}

const decodeRecord = (
  encodedRecord: EncodedRecord,
): DecodedRecord | undefined => {
  if (!encodedRecord.value) return;
  return {
    id: decodeBase64WithUtf8(encodedRecord.key),
    ...JSON.parse(decodeBase64WithUtf8(encodedRecord.value)),
  };
};

export default function handler(
  lambda: (eventData: DecodedRecord) => Promise<any>,
) {
  return async function (event: Event): Promise<LambdaResponse> {
    let eventQueue: EncodedRecord[] = [];
    let sendResults: any[] = [];
    const response: LambdaResponse = {
      statusCode: 200,
      body: null,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    };

    // If this invocation is a prewarm, do nothing and return.
    if (event.eventSource !== "serverless-plugin-warmup") {
      try {
        // Flatten the records so they are iterable
        Object.values(event.records).forEach((source) =>
          source.forEach((record) => {
            eventQueue.push({ ...record });
          }),
        );

        sendResults = await Promise.allSettled(
          eventQueue.map(async (record) => {
            try {
              const eventData = decodeRecord(record);
              if (!eventData) return { error: "no eventData?" };
              console.log("eventData: ", eventData);

              return await lambda(eventData);
            } catch (e) {
              return { error: (e as Error).message };
            }
          }),
        );

        response.body = JSON.stringify(sendResults);
      } catch (e) {
        response.body = (e as Error).message;
        console.log("error: ", e);
      }
      // Return HTTP response
      console.log("Response: ", JSON.stringify(response, null, 4));
    }
    return response;
  };
}
