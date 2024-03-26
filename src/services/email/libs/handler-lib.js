import { decode } from "base-64";

const decodeRecord = (encodedRecord) => {
    if (!encodedRecord.value) return;
    return { id: decode(encodedRecord.key), ...JSON.parse(decode(encodedRecord.value)) };
  };  

export default function handler(lambda) {
    return async function (event) {
        let eventQueue = [];
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
          // flatten the records so they are iterable
          Object.values(event.records).forEach((source) =>
          source.forEach((record) => {
            eventQueue.push({...record});
          }));
          sendResults = await Promise.allSettled(eventQueue.map(async (record) => {
            try {
            const eventData = decodeRecord(record);
            if (!eventData) return { error: "no eventData?"};
            console.log("eventData: ", eventData);

            return await lambda(eventData);
        } catch (e) {
            return { error: e.message };
          }

          }));
        response.body = JSON.stringify(sendResults);
      } catch (e) {
        response.body = e.message;
        console.log ("error: ", e);
      }
      // Return HTTP response
      console.log("Response: ", JSON.stringify(response, null, 4));
      return response;
    }
  };
}