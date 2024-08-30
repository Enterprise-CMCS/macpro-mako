import * as newMedicaidSubmission from "../../../events/new-medicaid-submission";

export const transform = (offset: number) => {
  return newMedicaidSubmission.schema.transform((data) => {
    const attachments = Object.entries(data.attachments).flatMap(
      ([title, attachment]) => {
        // Check if 'attachment' exists and has a non-empty 'files' array
        if (
          attachment &&
          Array.isArray(attachment.files) &&
          attachment.files.length > 0
        ) {
          // Map each file in 'files' array to the desired shape
          return attachment.files.map((file) => ({
            filename: file.filename,
            title,
            bucket: file.bucket,
            key: file.key,
            uploadDate: file.uploadDate,
          }));
        }
        // If there are no files or the files array is empty, return an empty array
        return [];
      },
    );
    return {
      ...data,
      attachments,
      packageId: data.id,
      id: `${data.id}-${offset}`,
    };
  });
};

export type Schema = ReturnType<typeof transform>;
