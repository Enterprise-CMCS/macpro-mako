import { Handler } from "aws-lambda";
import { decode } from "base-64";
import * as os from "./../../../libs/opensearch-lib";
import { SeaToolTransform, transformSeatoolData } from "shared-types/seatool";
import { OneMacTransform, transformOnemac } from "shared-types/onemac";
if (!process.env.osDomain) {
  throw "ERROR:  process.env.osDomain is required,";
}
import { ZodError } from "zod";
const osDomain: string = process.env.osDomain;
const index = "main";

export const seatool: Handler = async (event) => {
  const seaToolRecords: SeaToolTransform[] = [];

  for (const recordKey of Object.keys(event.records)) {
    for (const seatoolRecord of event.records[recordKey] as {
      key: string;
      value: string;
    }[]) {
      const { key, value } = seatoolRecord;
      const id: string = JSON.parse(decode(key));
      const record = { id, ...JSON.parse(decode(value)) };

      // we need to handle the case of null records for value
      // this is a delete event so we will need to delete

      try {
        const transformedRecord = transformSeatoolData(id).parse(record);
        seaToolRecords.push(transformedRecord);
      } catch (err: unknown) {
        if (err instanceof ZodError) {
          console.log(
            "The validation and transformation of data failed: ",
            err.message
          );
        } else {
          console.log("A non validation error occured: ", err);
        }
      }
    }
  }

  try {
    for (const item of seaToolRecords) {
      await os.updateData(osDomain, {
        index,
        id: item.id,
        body: {
          doc: item,
          doc_as_upsert: true,
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
};

export const onemac: Handler = async (event) => {
  const oneMacRecords: OneMacTransform[] = [];

  for (const recordKey of Object.keys(event.records)) {
    for (const onemacRecord of event.records[recordKey] as {
      key: string;
      value: string;
    }[]) {
      const { key, value } = onemacRecord;
      const id: string = JSON.parse(decode(key));
      const record = { id, ...JSON.parse(decode(value)) };

      if (value && record && record.sk === "Package") {
        const transformedRecord = transformOnemac(id).parse(record);

        oneMacRecords.push(transformedRecord);
      }
    }
  }

  try {
    for (const item of oneMacRecords) {
      await os.updateData(osDomain, {
        index,
        id: item.id,
        body: {
          doc: item,
          doc_as_upsert: true,
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
};

// export const onemac: Handler = async (event) => {
//   const records: Record<string, unknown>[] = [];
//   for (const key in event.records) {
//     event.records[key].forEach(
//       ({ key, value }: { key: string; value: string }) => {
//         const id: string = decode(key);
//         const eventData: Record<any, any> = {};
//         if (!value) {
//           // handle delete somehow
//         } else {
//           const record = { ...JSON.parse(decode(value)) };

//           if (record.sk !== "Package") {
//             console.log("Not a package type - ignoring");
//             return;
//           }
//           eventData.attachments = record.attachments || null;
//           if (record.attachments && Array.isArray(record.attachments)) {
//             eventData.attachments = record.attachments.map((attachment) => {
//               const uploadDate = parseInt(attachment.s3Key.split("/")[0]);
//               delete attachment.s3Key; // Once we have the date, this value is useless to us.  It's not the actual key
//               const { bucket, key } = s3ParseUrl(attachment.url);
//               return {
//                 ...attachment,
//                 uploadDate,
//                 bucket,
//                 key,
//               };
//             });
//           }
//           eventData.additionalInformation =
//             record.additionalInformation || null;
//           eventData.submitterName = record.submitterName || null;
//           eventData.submitterEmail = record.submitterEmail || null;
//           eventData.submissionOrigin = "OneMAC";
//           if (Object.keys(eventData).length) {
//             records.push({
//               key: id,
//               value: eventData,
//             });
//           }
//         }
//       }
//     );
//   }
//   try {
//     for (const item of records) {
//       await os.updateData(osDomain, {
//         index,
//         id: item.key,
//         body: {
//           doc: item.value,
//           doc_as_upsert: true,
//         },
//       });
//     }
//   } catch (error) {
//     console.error(error);
//   }
// };
