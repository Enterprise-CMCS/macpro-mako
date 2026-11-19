import { events } from "../../../index";
import { flattenSlotAttachments } from "./flatten-slot-attachments";

export const transform = (offset: number) => {
  return events["ce-record-submitted"].schema.transform((data) => {
    return {
      ...data,
      attachments: flattenSlotAttachments(data.attachments),
      packageId: data.id,
      id: `${data.id}-${offset}`,
    };
  });
};

export type Schema = ReturnType<typeof transform>;
