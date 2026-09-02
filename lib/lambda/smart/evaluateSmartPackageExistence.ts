import * as os from "libs/opensearch-lib";
import { getDomainAndNamespace } from "libs/utils";

import { SmartOnemacEvent } from "./parseSmartOnemacEvent";

export interface SmartPackageExistence {
  mainById: Awaited<ReturnType<typeof os.getItem>>;
  mainBySpaWaiverId: Awaited<ReturnType<typeof os.search>>;
  changelogById: Awaited<ReturnType<typeof os.search>>;
}

export interface SmartKafkaMetadata {
  topicPartition: string;
  kafkaKey?: string;
  kafkaOffset?: number;
  kafkaTimestamp?: number;
}

export interface SmartOnemacEventContext extends SmartKafkaMetadata {
  event: SmartOnemacEvent;
  existence: SmartPackageExistence;
}

export const evaluateSmartPackageExistence = async (
  event: SmartOnemacEvent,
): Promise<SmartPackageExistence> => {
  const documentId = event.id.toUpperCase();
  const { domain, index: mainIndex } = getDomainAndNamespace("main");
  const { index: changelogIndex } = getDomainAndNamespace("changelog");

  const [mainById, mainBySpaWaiverId, changelogById] = await Promise.all([
    os.getItem(domain, mainIndex, documentId),
    os.search(domain, mainIndex, {
      query: {
        term: { spaWaiverId: event.spaWaiverId },
      },
    }),
    os.search(domain, changelogIndex, {
      from: 0,
      size: 200,
      sort: [{ timestamp: "desc" }],
      query: {
        bool: {
          must: [{ term: { "packageId.keyword": documentId } }],
        },
      },
    }),
  ]);

  return { mainById, mainBySpaWaiverId, changelogById };
};
