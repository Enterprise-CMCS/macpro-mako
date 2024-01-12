import { getAttachmentUrl } from "@/api";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useState } from "react";
import { opensearch } from "shared-types";

type Attachments = NonNullable<opensearch.changelog.Document["attachments"]>;

export const useAttachmentService = (
  props: Pick<opensearch.changelog.Document, "packageId">
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onUrl = async (ATT: Attachments[number]) => {
    setLoading(true);
    try {
      return await getAttachmentUrl(
        props.packageId,
        ATT.bucket,
        ATT.key,
        ATT.filename
      );
    } catch (e) {
      const err = e instanceof Error ? e.message : "Failed download";
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const onZip = (attachments: Attachments) => {
    setLoading(true);
    const zip = new JSZip();

    const remoteZips = attachments.map(async (ATT, index) => {
      const url = await onUrl(ATT);
      if (!url) return;
      const response = await fetch(url);
      const data = await response.blob();
      zip.file(`${ATT.filename}_${index + 1}`, data);
      return data;
    });

    Promise.all(remoteZips)
      .then(() => {
        zip.generateAsync({ type: "blob" }).then((content) => {
          saveAs(content, `package-actions-${new Date().toISOString()}.zip`);
        });
      })
      .catch((e) => {
        const err = e instanceof Error ? e.message : "Failed download";
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return { loading, error, onUrl, onZip };
};
