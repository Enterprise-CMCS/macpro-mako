import { search } from "libs/opensearch-lib";

import { getDomainAndNamespace } from "../libs/utils";

export const ATTACHMENT_ARCHIVE_BACKFILL_PAGE_SIZE = 25;
const COMPOSITE_PAGE_SIZE = 500;

type CompositeBucket = {
  key: Record<string, string>;
};

type CompositeAggregationResult = {
  after_key?: Record<string, string>;
  buckets?: CompositeBucket[];
};

function getAttachmentArchiveEligibilityQuery() {
  return {
    bool: {
      filter: [{ exists: { field: "attachments.key" } }],
      must_not: [{ term: { isAdminChange: true } }],
    },
  };
}

async function searchCompositeAggregation({
  after,
  size,
  sources,
}: {
  after?: Record<string, string>;
  size: number;
  sources: Array<Record<string, unknown>>;
}) {
  const { domain, index } = getDomainAndNamespace("changelog");

  return (await search(domain, index, {
    size: 0,
    query: getAttachmentArchiveEligibilityQuery(),
    aggs: {
      values: {
        composite: {
          size,
          ...(after ? { after } : {}),
          sources,
        },
      },
    },
  })) as {
    aggregations?: {
      values?: CompositeAggregationResult;
    };
  };
}

export async function getAttachmentArchiveBackfillPage({ afterKey }: { afterKey?: string }) {
  const result = await searchCompositeAggregation({
    after: afterKey ? { packageId: afterKey } : undefined,
    size: ATTACHMENT_ARCHIVE_BACKFILL_PAGE_SIZE,
    sources: [
      {
        packageId: {
          terms: {
            field: "packageId.keyword",
          },
        },
      },
    ],
  });

  const buckets = result.aggregations?.values?.buckets || [];
  const nextAfterKey = result.aggregations?.values?.after_key?.packageId;

  return {
    afterKey: nextAfterKey,
    done: !nextAfterKey,
    packageIds: buckets
      .map((bucket) => bucket.key.packageId)
      .filter((packageId): packageId is string => Boolean(packageId)),
  };
}

export function isDeletedAttachmentArchivePackageId(packageId: string) {
  return packageId.endsWith("-del");
}

export function filterActiveAttachmentArchivePackageIds(packageIds: string[]) {
  const activePackageIds: string[] = [];
  let skippedDeletedPackageCount = 0;

  for (const packageId of packageIds) {
    if (isDeletedAttachmentArchivePackageId(packageId)) {
      skippedDeletedPackageCount += 1;
      continue;
    }

    activePackageIds.push(packageId);
  }

  return {
    packageIds: activePackageIds,
    skippedDeletedPackageCount,
  };
}

export async function listAllAttachmentArchivePackageIds() {
  const packageIds = new Set<string>();
  let after: Record<string, string> | undefined;

  while (true) {
    const result = await searchCompositeAggregation({
      after,
      size: COMPOSITE_PAGE_SIZE,
      sources: [
        {
          packageId: {
            terms: {
              field: "packageId.keyword",
            },
          },
        },
      ],
    });

    const aggregation = result.aggregations?.values;
    for (const bucket of aggregation?.buckets || []) {
      if (bucket.key.packageId) {
        packageIds.add(bucket.key.packageId);
      }
    }

    after = aggregation?.after_key;
    if (!after) {
      return Array.from(packageIds).sort();
    }
  }
}

export async function listAllAttachmentArchiveSections() {
  const sections = new Set<string>();
  let after: Record<string, string> | undefined;

  while (true) {
    const result = await searchCompositeAggregation({
      after,
      size: COMPOSITE_PAGE_SIZE,
      sources: [
        {
          packageId: {
            terms: {
              field: "packageId.keyword",
            },
          },
        },
        {
          sectionId: {
            terms: {
              field: "id.keyword",
            },
          },
        },
      ],
    });

    const aggregation = result.aggregations?.values;
    for (const bucket of aggregation?.buckets || []) {
      if (bucket.key.packageId && bucket.key.sectionId) {
        sections.add(`${bucket.key.packageId}::${bucket.key.sectionId}`);
      }
    }

    after = aggregation?.after_key;
    if (!after) {
      return Array.from(sections).sort();
    }
  }
}
