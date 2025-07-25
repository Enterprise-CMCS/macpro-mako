import { events } from "../../../index";

export const transform = (offset: number) => {
  return events["upload-subsequent-documents"].schema.transform((data) => {
    const attachments = data.attachments
      ? Object.entries(data.attachments).flatMap(([, attachment]) => {
          // Check if 'attachment' exists and has a non-empty 'files' array
          if (attachment?.files && Array.isArray(attachment.files) && attachment.files.length > 0) {
            // Map each file in 'files' array to the desired shape
            return attachment.files.map((file) => ({
              filename: file.filename,
              title: attachment.label === "CMS Form 179" ? "CMS-179 Form" : attachment.label,
              bucket: file.bucket,
              key: file.key,
              uploadDate: file.uploadDate,
            }));
          }
          // If there are no files or the files array is empty, return an empty array
          return [];
        })
      : [];
    return {
      ...data,
      attachments,
      packageId: data.id,
      id: `${data.id}-${offset}`,
    };
  });
};

export type Schema = ReturnType<typeof transform>;
