import { events } from "shared-types";
export const transform = (offset: number) => {
  return events["app-k"].schema.transform((data) => {
    const attachments = data.attachments
      ? Object.entries(data.attachments).flatMap(
          //eslint-disable-next-line
          ([_title, attachment]) => {
            // Check if 'attachment' exists and has a non-empty 'files' array
            if (
              attachment?.files &&
              Array.isArray(attachment.files) &&
              attachment.files.length > 0
            ) {
              // Map each file in 'files' array to the desired shape
              return attachment.files.map((file) => ({
                filename: file.filename,
                title: attachment.label,
                bucket: file.bucket,
                key: file.key,
                uploadDate: file.uploadDate,
              }));
            }
            // If there are no files or the files array is empty, return an empty array
            return [];
          },
        )
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
