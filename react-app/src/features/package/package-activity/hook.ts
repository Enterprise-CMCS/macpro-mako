import { getAttachmentUrl } from "@/api";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { opensearch } from "shared-types";
import { useMutation } from "@tanstack/react-query";

export type Attachments = NonNullable<opensearch.changelog.Document["attachments"]>;

export const useAttachmentService = ({ packageId }: { packageId: string }) => {
  const { mutateAsync, error, isLoading } = useMutation((attachment: Attachments[number]) =>
    getAttachmentUrl(packageId, attachment.bucket, attachment.key, attachment.filename),
  );

  const onZip = (attachments: Attachments) => {
    if (attachments.length === 0) {
      return;
    }

    const zip = new JSZip();

    const remoteZips = attachments.map(async (attachment, index) => {
      const url = await mutateAsync(attachment);
      if (!url) return;
      const data = await fetch(url).then((res) => res.blob());

      // append index for uniqueness (fileone.md -> fileone(1).md)
      const filename = (() => {
        const pieces = attachment.filename.split(".");
        const ext = pieces.pop();
        return `${pieces.join(".")}(${index + 1}).${ext}`;
      })();

      zip.file(filename, data);
      return data;
    });

    Promise.allSettled(remoteZips)
      .then(async () => {
        const asyncZipContent = await zip.generateAsync({ type: "blob" });
        saveAs(asyncZipContent, `${packageId} - ${new Date().toDateString()}.zip`);
      })
      .catch(console.error);
  };

  return { loading: isLoading, error, onUrl: mutateAsync, onZip };
};
