import { Handler } from 'aws-lambda';

export const handler: Handler = async (event) => {
  console.log(JSON.stringify(event, null, 2));
  // for (const [topic, eventArray] of Object.entries(event.records)) {
  //   console.log(`Topic ${topic}:`);
  //   console.log(eventArray);
  //   console.log('end');
  // }
};