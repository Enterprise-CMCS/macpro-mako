import { getAttachmentUrl } from "@/api";
import { format } from "date-fns";
import { BLANK_VALUE } from "consts";
import { DownloadIcon } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { OsMainSourceItem } from "shared-types";
import { useState } from "react";
import { Button } from "../Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../Table";

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
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Document Type</TableHead>
            <TableHead className="text-left">Attached File</TableHead>
            <TableHead className="text-left">Upload Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.attachments ? (
            data.attachments.map((attachment) => {
              if (!attachment) return null;
              return (
                <TableRow key={attachment.key}>
                  <TableHead>
                    <p className="text-sm font-bold">{attachment.title}</p>
                  </TableHead>
                  <TableCell>
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
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-slate-500 text-sm">
                      {attachment.uploadDate ? (
                        <>
                          <p>{format(attachment.uploadDate, "MM/dd/yyyy")}</p>
                          <p>{format(attachment.uploadDate, "h:mm a")}</p>
                        </>
                      ) : (
                        <p>{BLANK_VALUE}</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <p className="text-sm font-bold p-4">
              No attachments have been submitted.
            </p>
          )}
        </TableBody>
      </Table>
      <div className="flex justify-end">
        {data.attachments && (
          <Button
            variant={"secondary"}
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              await handleDownloadAll(data);
              setLoading(false);
            }}
            type="button"
          >
            <DownloadIcon className="w-4 h-4" />
            {loading ? "Downloading" : "Download All"}
          </Button>
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
