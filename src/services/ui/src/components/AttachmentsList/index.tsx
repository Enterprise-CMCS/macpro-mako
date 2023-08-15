import { getAttachmentUrl } from "@/api";
import { Button, TD, TH, Table } from "@enterprise-cmcs/macpro-ux-lib";
import { format } from "date-fns";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { OsMainSourceItem } from "shared-types";

const handleDownloadAll = async (data: OsMainSourceItem) => {
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

export const Attachmentslist = (data: OsMainSourceItem) => {
  return (
    <div>
      <Table borderless className="w-full">
        <thead>
          <tr>
            <TH>Document Type</TH>
            <TH>Attached File</TH>
            <TH>Upload Date</TH>
          </tr>
        </thead>
        <tbody>
          {data.attachments?.map((attachment) => {
            if (!attachment) return null;
            return (
              <tr key={attachment.key}>
                <TH rowHeader>
                  <p className="text-sm font-bold">{attachment.title}</p>
                </TH>
                <TD>
                  <div className="text-sm">
                    <button
                      className="text-blue-600"
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
                    {/* originally wanted the size as well, but that data is missing*/}
                    <p>
                      (
                      {attachment.contentType
                        ? attachment.contentType.split("/").slice(-1)
                        : "Unknown"}
                      )
                    </p>
                  </div>
                </TD>
                <TD>
                  <div className="text-slate-500 text-sm">
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
          })}
        </tbody>
      </Table>
      <div className="flex justify-end">
        {data.attachments && (
          <Button
            buttonText="Download All"
            buttonVariation="secondary"
            iconName="file_download"
            onClick={() => handleDownloadAll(data)}
            target="_self"
            type="button"
            style={{ padding: "4px" }}
          />
        )}
      </div>
    </div>
  );
};

type Attachments = {
  url: string;
  uploadDate: number;
  bucket: string;
  key: string;
  s3Key: string;
  filename: string;
  title: string;
  contentType: string;
}[];

async function downloadAll(attachments: Attachments, id: string) {
  const downloadList = (await Promise.all(
    attachments
      .map(async (attachment) => {
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
