import { getAttachmentUrl } from "@/api";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import { opensearch } from "shared-types";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";

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

export const ACTIONS_PA = [
  "new-submission",
  "withdraw-rai",
  "withdraw-package",
  "issue-rai",
  "respond-to-rai",
];

export const usePackageActivities = (props: opensearch.main.Document) => {
  const service = useAttachmentService({ packageId: props.id });
  const data = useMemo(
    () =>
      props.changelog?.filter((CL) =>
        ACTIONS_PA.includes(CL._source.actionType)
      ),
    [props.changelog]
  );

  const onDownloadAll = () => {
    const attachmentsAggregate = props.changelog?.reduce((ACC, ATT) => {
      if (!ATT._source.attachments) return ACC;
      return ACC.concat(ATT._source.attachments);
    }, [] as any);

    if (!attachmentsAggregate.length) return;

    service.onZip(attachmentsAggregate);
  };

  return {
    data,
    accordianDefault: [data?.[0]._source.id as string],
    onDownloadAll,
    ...service,
  };
};
