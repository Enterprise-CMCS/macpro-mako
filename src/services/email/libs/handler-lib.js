import { decode } from "base-64";

const decodeRecord = (encodedRecord) => {
    if (!encodedRecord.value) return;
    return { id: decode(encodedRecord.key), ...JSON.parse(decode(encodedRecord.value)) };
  };  

export default function handler(lambda) {
    return async function (event) {
        console.log("Received event (stringified):", JSON.stringify(event, null, 4));

        let sendResults = [];
      const response = {
        statusCode: 200,
        body: null,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
      };
  
      // If this invokation is a prewarm, do nothing and return.
      if (event.eventSource != "serverless-plugin-warmup") {
        try {
          sendResults = await Promise.allSettled(Object.values(event.records).forEach(async (source) =>
          source.forEach(async (record) => {
            try {
            const eventData = decodeRecord(record);
            console.log("eventData: ", eventData);
            if (!eventData) return;

            return await lambda(eventData);
        } catch (e) {
            console.log ("event failure: ", eventData);
            return { eventData, error: e.message };
          }
  
          })))
        response.body = JSON.stringify(sendResults);
      } catch (e) {
        response.body = e.message;
        console.log ("error: ", e);
      }
      // Return HTTP response
      return response;
    };
  }}