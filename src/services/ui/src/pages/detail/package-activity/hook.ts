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
      const data = await fetch(url).then((res) => res.blob());

      // append index for uniqueness (fileone.md -> fileone(1).md)
      const filename = (() => {
        const pieces = ATT.filename.split(".");
        const ext = pieces.pop();
        return `${pieces.join(".")}(${index + 1}).${ext}`;
      })();

      zip.file(filename, data);
      return data;
    });

    Promise.allSettled(remoteZips)
      .then(() => {
        zip.generateAsync({ type: "blob" }).then((content) => {
          saveAs(
            content,
            `${props.packageId} - ${new Date().toDateString()}.zip`
          );
        });
      })
      .catch((e) => {
        console.error(e);
      });
  };

  return { loading: isLoading, error, onUrl: mutateAsync, onZip };
};

export const usePackageActivities = (props: opensearch.main.Document) => {
  const service = useAttachmentService({ packageId: props.id });
  const data = props.changelog?.filter((CL) =>
    [
      "new-submission",
      "withdraw-rai",
      "withdraw-package",
      "issue-rai",
      "respond-to-rai",
    ].includes(CL._source.actionType)
  );

  const onDownloadAll = () => {
    // gathering all attachments across each changelog
    const attachmentsAggregate = props.changelog?.reduce((ACC, ATT) => {
      if (!ATT._source.attachments) return ACC;
      return ACC.concat(ATT._source.attachments);
    }, [] as any);

    if (!attachmentsAggregate.length) return;

    service.onZip(attachmentsAggregate);
  };

  return {
    data,
    accordianDefault: [data?.[0]?._source?.id as string],
    onDownloadAll,
    ...service,
  };
};
