import { getAttachmentUrl } from "@/api";
import { Button, TD, TH, Table } from "@enterprise-cmcs/macpro-ux-lib";
import { format } from "date-fns";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { OsMainSourceItem } from "shared-types";
import { useState } from "react";

type AttachmentList = {
  id: string;
  attachments:
    | ({
        uploadDate: number;
        bucket: string;
        key: string;
        s3Key: string;
        filename: string;
        title: string;
        contentType: string;
        url: string;
      } | null)[]
    | null;
};

const handleDownloadAll = async (data: AttachmentList) => {
  if (data.attachments && data.attachments.length > 0) {
    const validAttachments = data.attachments.filter(
      (attachment): attachment is NonNullable<typeof attachment> =>
        attachment !== null
    );

    if (validAttachments.length > 0) {
      const attachmentPromises = validAttachments.map(async (attachment) => {
        const url = await getAttachmentUrl(
          data.id,
          attachment.bucket,
          attachment.key
        );
        return { ...attachment, url };
      });

      const resolvedAttachments = await Promise.all(attachmentPromises);
      downloadAll(resolvedAttachments, data.id);
    }
  }
};

export const Attachmentslist = (data: AttachmentList) => {
  const [loading, setLoading] = useState(false);
  return (
    <div>
      <Table borderless className="tw-w-full">
        <thead>
          <tr>
            <TH>Document Type</TH>
            <TH>Attached File</TH>
            <TH>Upload Date</TH>
          </tr>
        </thead>
        <tbody>
          {data.attachments ? (
            data.attachments.map((attachment) => {
              if (!attachment) return null;
              return (
                <tr key={attachment.key}>
                  <TH rowHeader>
                    <p className="tw-text-sm tw-font-bold">
                      {attachment.title}
                    </p>
                  </TH>
                  <TD>
                    <div className="tw-text-sm">
                      <button
                        className="tw-text-blue-600"
                        onClick={async () => {
                          const url = await getAttachmentUrl(
                            data.id,
                            attachment.bucket,
                            attachment.key
                          );
                          console.log(url);
                          window.open(url);
                        }}
                      >
                        {attachment.filename}
                      </button>
                    </div>
                  </TD>
                  <TD>
                    <div className="tw-text-slate-500 tw-text-sm">
                      {attachment.uploadDate ? (
                        <>
                          <p>{format(attachment.uploadDate, "MM/dd/yyyy")}</p>
                          <p>{format(attachment.uploadDate, "h:mm a")}</p>
                        </>
                      ) : (
                        <p>Unknown</p>
                      )}
                    </div>
                  </TD>
                </tr>
              );
            })
          ) : (
            <p className="tw-text-sm tw-font-bold tw-p-4">
              No Attachments To Show
            </p>
          )}
        </tbody>
      </Table>
      <div className="tw-flex tw-justify-end">
        {data.attachments && (
          <Button
            buttonText={loading ? "Downloading" : "Download All"}
            buttonVariation="secondary"
            disabled={loading}
            iconName="file_download"
            onClick={async () => {
              setLoading(true);
              await handleDownloadAll(data);
              setLoading(false);
            }}
            target="_self"
            type="button"
            style={{ padding: "4px" }}
          />
        )}
      </div>
    </div>
  );
};

async function downloadAll(
  attachments: OsMainSourceItem["attachments"],
  id: string
) {
  if (!attachments) return null;
  const downloadList = (await Promise.all(
    attachments
      .map(async (attachment) => {
        if (!attachment) return null;
        try {
          const resp = await fetch(attachment.url);
          if (!resp.ok) throw resp;
          return {
            filename: attachment.filename,
            title: attachment.title,
            contents: await resp.blob(),
          };
        } catch (e) {
          console.error(
            `Failed to download file: ${attachment.filename} ${attachment.url}`,
            e
          );
        }
      })
      .filter(Boolean)
  )) as { filename: string; title: string; contents: Blob }[];
  const zip = new JSZip();
  for (const { filename, title, contents } of downloadList) {
    zip.file(filename, contents, { comment: title });
  }
  saveAs(await zip.generateAsync({ type: "blob" }), `${id || "onemac"}.zip`);
}
