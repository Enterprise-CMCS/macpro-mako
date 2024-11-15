import { getAttachmentUrl, useGetItem } from "@/api";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { opensearch } from "shared-types";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

type Attachments = NonNullable<opensearch.changelog.Document["attachments"]>;

export const useAttachmentService = ({ packageId }: { packageId: string }) => {
  const { mutateAsync, error, isLoading } = useMutation(
    (att: Attachments[number]) =>
      getAttachmentUrl(packageId, att.bucket, att.key, att.filename),
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
          saveAs(content, `${packageId} - ${new Date().toDateString()}.zip`);
        });
      })
      .catch((e) => {
        console.error(e);
      });
  };

  return { loading: isLoading, error, onUrl: mutateAsync, onZip };
};

export const usePackageActivities = () => {
  const { id } = useParams();
  const { data: submission } = useGetItem(id);

  const service = useAttachmentService({ packageId: submission._id });

  const onDownloadAll = () => {
    const attachmentsAggregate = submission._source.changelog?.reduce(
      (ACC, ATT) => {
        if (!ATT._source.attachments) return ACC;
        return ACC.concat(ATT._source.attachments);
      },
      [] as any,
    );

    if (attachmentsAggregate.length === 0) return;

    service.onZip(attachmentsAggregate);
  };

  return {
    data: submission._source.changelog,
    accordianDefault: [submission._source.changelog?.[0]?._source?.id],
    onDownloadAll,
    ...service,
  };
};
