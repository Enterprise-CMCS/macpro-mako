import {
  getStatus,
  type opensearch,
  SEATOOL_STATUS,
  statusToDisplayToCmsUser,
  statusToDisplayToStateUser,
} from "shared-types";

import { ATTACHMENT_BUCKET_NAME, REGION } from "../../../mocks/consts";

export type SeedPackageOptions = {
  id?: string;
  status?: string;
  authority?: string;
  state?: string;
  proposedDate?: number | string;
  attachments?: Array<{
    title: string;
    filename: string;
    key?: string;
    bucket?: string;
  }>;
  submitterName?: string;
  submitterEmail?: string;
};

export type PackageRecord = opensearch.main.ItemResult;

const ZIP_BYTES = Buffer.from("PK\u0005\u0006" + "\u0000".repeat(18)); // empty zip EOCD
const PDF_BYTES = Buffer.from(
  "%PDF-1.1\n1 0 obj<<>>endobj\ntrailer<< /Root 1 0 R >>\n%%EOF\n",
  "utf8",
);

export class BackendStore {
  packages = new Map<string, PackageRecord>();
  archivePollCounts = new Map<string, number>();

  seedPackage(options: SeedPackageOptions = {}): PackageRecord {
    const id = (options.id ?? `MD-26-${String(this.packages.size + 1).padStart(4, "0")}-SEED`)
      .trim()
      .toUpperCase();
    const status = options.status ?? SEATOOL_STATUS.SUBMITTED;
    const authority = options.authority ?? "Medicaid SPA";
    const state = options.state ?? id.split("-")[0] ?? "MD";
    const now = new Date().toISOString();
    const proposedDate = options.proposedDate ?? Date.UTC(2026, 5, 1);
    const attachments = (options.attachments ?? defaultAttachments()).map((attachment, index) => ({
      title: attachment.title,
      filename: attachment.filename,
      bucket: attachment.bucket ?? ATTACHMENT_BUCKET_NAME,
      key: attachment.key ?? `e2e/${id}/${index}-${attachment.filename}`,
      uploadDate: Date.now(),
    }));

    const { stateStatus, cmsStatus } = getStatus(status as any) ?? {
      stateStatus: statusToDisplayToStateUser[status as keyof typeof statusToDisplayToStateUser],
      cmsStatus: statusToDisplayToCmsUser[status as keyof typeof statusToDisplayToCmsUser],
    };

    const record: PackageRecord = {
      _id: id,
      found: true,
      _source: {
        id,
        authority,
        state,
        origin: "OneMAC",
        actionType: "New",
        seatoolStatus: status,
        stateStatus: stateStatus ?? status,
        cmsStatus: cmsStatus ?? status,
        submissionDate: now,
        changedDate: now,
        makoChangedDate: now,
        proposedDate,
        submitterName: options.submitterName ?? "Stateuser Tester",
        submitterEmail: options.submitterEmail ?? "mako.stateuser@gmail.com",
        initialIntakeNeeded: status === SEATOOL_STATUS.SUBMITTED,
        raiWithdrawEnabled: false,
        changelog: [
          {
            _id: `${id}-001`,
            _source: {
              id: `${id}-0001`,
              packageId: id,
              event: "new-medicaid-submission",
              authority,
              timestamp: Date.now(),
              proposedEffectiveDate: proposedDate,
              submitterName: options.submitterName ?? "Stateuser Tester",
              submitterEmail: options.submitterEmail ?? "mako.stateuser@gmail.com",
              attachments,
            },
          },
        ],
        attachments: {
          cmsForm179: {
            label: "CMS-179 Form",
            files: attachments.filter((a) => a.title.includes("CMS-179")),
          },
          spaPages: {
            label: "SPA Pages",
            files: attachments.filter((a) => a.title.includes("SPA")),
          },
        },
      },
    };

    this.packages.set(id, record);
    return record;
  }

  upsertFromSubmit(body: Record<string, any>): PackageRecord {
    const id = String(body.id).trim().toUpperCase();
    const existing = this.packages.get(id);
    // ActionForm may omit zod defaults on the wire; infer withdraw from payload shape.
    const event = String(
      body.event ||
        (body.attachments?.supportingDocumentation || body.attachments?.officialWithdrawalLetter
          ? "withdraw-package"
          : "new-medicaid-submission"),
    );

    if (event === "withdraw-package" || event === "withdraw-package-chip") {
      const base =
        existing ??
        this.seedPackage({
          id,
          status: SEATOOL_STATUS.SUBMITTED,
          authority: body.authority || "Medicaid SPA",
        });
      const now = new Date().toISOString();
      const updated: PackageRecord = {
        ...base,
        _source: {
          ...base._source,
          seatoolStatus: SEATOOL_STATUS.WITHDRAW_REQUESTED,
          stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.WITHDRAW_REQUESTED],
          cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.WITHDRAW_REQUESTED],
          changedDate: now,
          makoChangedDate: now,
          changelog: [
            ...(base._source?.changelog || []),
            {
              _id: `${id}-withdraw-${Date.now()}`,
              _source: {
                id: `${id}-withdraw`,
                packageId: id,
                event,
                timestamp: Date.now(),
                additionalInformation: body.additionalInformation ?? null,
                attachments: flattenSubmitAttachments(body.attachments),
              },
            },
          ],
        },
      };
      this.packages.set(id, updated);
      return updated;
    }

    const proposedDate = body.proposedEffectiveDate ?? Date.UTC(2026, 5, 1);
    const attachments = flattenSubmitAttachments(body.attachments);
    const now = new Date().toISOString();
    const { stateStatus, cmsStatus } = getStatus(SEATOOL_STATUS.SUBMITTED);

    const record: PackageRecord = {
      _id: id,
      found: true,
      _source: {
        id,
        authority: body.authority || "Medicaid SPA",
        state: id.split("-")[0],
        origin: "OneMAC",
        actionType: "New",
        seatoolStatus: SEATOOL_STATUS.SUBMITTED,
        stateStatus,
        cmsStatus,
        submissionDate: now,
        changedDate: now,
        makoChangedDate: now,
        proposedDate,
        submitterName: body.submitterName ?? "Stateuser Tester",
        submitterEmail: body.submitterEmail ?? "mako.stateuser@gmail.com",
        additionalInformation: body.additionalInformation ?? null,
        initialIntakeNeeded: true,
        raiWithdrawEnabled: false,
        changelog: [
          {
            _id: `${id}-001`,
            _source: {
              id: `${id}-0001`,
              packageId: id,
              event,
              authority: body.authority || "Medicaid SPA",
              timestamp: Date.now(),
              proposedEffectiveDate: proposedDate,
              attachments,
              additionalInformation: body.additionalInformation ?? null,
              submitterName: body.submitterName ?? "Stateuser Tester",
              submitterEmail: body.submitterEmail ?? "mako.stateuser@gmail.com",
            },
          },
        ],
        attachments: body.attachments,
      },
    };

    this.packages.set(id, record);
    return record;
  }

  list(authorityFilter?: string[], search?: string): PackageRecord[] {
    let items = [...this.packages.values()];
    if (authorityFilter?.length) {
      items = items.filter((item) => authorityFilter.includes(item._source?.authority || ""));
    }
    if (search?.trim()) {
      const needle = search.trim().toLowerCase();
      items = items.filter((item) => {
        const source = item._source || {};
        return [source.id, source.submitterName, source.leadAnalystName]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle));
      });
    }
    return items;
  }

  get(id: string): PackageRecord | undefined {
    return this.packages.get(id.trim().toUpperCase());
  }

  nextArchiveStatus(id: string, scope: string, sectionId?: string) {
    const key = `${id}:${scope}:${sectionId || ""}`;
    const count = this.archivePollCounts.get(key) ?? 0;
    this.archivePollCounts.set(key, count + 1);

    if (count === 0) {
      return {
        status: "PENDING" as const,
        pollAfterSeconds: 0.2,
        reason: "SOURCE_SCAN_PENDING",
        message:
          "Attachments are being scanned. Your download will start automatically when scanning is complete.",
      };
    }

    const scopeSuffix = scope === "section" && sectionId ? `-${sectionId}` : "";
    const filename = `${id}${scopeSuffix}-attachments.zip`;
    return {
      status: "READY" as const,
      filename,
      url: `https://archive-bucket.s3.${REGION}.amazonaws.com/${filename}`,
    };
  }

  attachmentDownloadUrl(id: string, bucket: string, key: string, filename: string): string {
    // Virtual-hosted–style URL so browser + MSW both treat it as an S3 object GET.
    return `https://${bucket}.s3.${REGION}.amazonaws.com/${id}/${encodeURIComponent(key)}/${encodeURIComponent(filename)}`;
  }

  fileBytesForUrl(url: string): { body: Buffer; contentType: string; filename: string } {
    if (
      url.endsWith(".zip") ||
      url.includes("archive-bucket") ||
      url.includes("-attachments.zip")
    ) {
      const filename = decodeURIComponent(url.split("/").pop() || "attachments.zip");
      return { body: ZIP_BYTES, contentType: "application/zip", filename };
    }
    const filename = decodeURIComponent(url.split("/").pop() || "attachment.pdf");
    return { body: PDF_BYTES, contentType: "application/pdf", filename };
  }
}

function defaultAttachments() {
  return [
    { title: "CMS-179 Form", filename: "cms-179.pdf", key: "cms-179.pdf" },
    { title: "SPA Pages", filename: "spa-pages.pdf", key: "spa-pages.pdf" },
  ];
}

function flattenSubmitAttachments(attachments: Record<string, any> | undefined) {
  if (!attachments) return [];
  return Object.values(attachments).flatMap((group: any) => {
    const label = group?.label || "Attachment";
    const files = group?.files || [];
    return files.map((file: any) => ({
      title: label,
      filename: file.filename,
      bucket: file.bucket || ATTACHMENT_BUCKET_NAME,
      key: file.key || file.filename,
      uploadDate: file.uploadDate || Date.now(),
    }));
  });
}
