import { getAttachmentUrl } from "@/api";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import { opensearch } from "shared-types";
import { useMutation } from "@tanstack/react-query";

type Attachments = NonNullable<opensearch.changelog.Document["attachments"]>;

export const useAttachmentService = (
  props: Pick<opensearch.changelog.Document, "packageId">
) => {
  const { mutateAsync, error, isLoading } = useMutation(
    (att: Attachments[number]) =>
      getAttachmentUrl(props.packageId, att.bucket, att.key, att.filename)
  );

  const onZip = (attachments: Attachments) => {
    const zip = new JSZip();

    const remoteZips = attachments.map(async (ATT, index) => {
      const url = await mutateAsync(ATT);
      if (!url) return;
      const response = await fetch(url);
      const data = await response.blob();
      const [prefix, extension] = ATT.filename.split(".");
      zip.file(`${prefix}(${index + 1}).${extension}`, data);
      return data;
    });

    Promise.allSettled(remoteZips)
      .then(() => {
        zip.generateAsync({ type: "blob" }).then((content) => {
          saveAs(content, `package-actions-${new Date().toISOString()}.zip`);
        });
      })
      .catch((e) => {
        console.error(e);
      });
  };

  return { loading: isLoading, error, onUrl: mutateAsync, onZip };
};
