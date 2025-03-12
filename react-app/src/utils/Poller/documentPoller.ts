import { PackageCheck } from "shared-utils";

import { DataPoller } from "./DataPoller";

import { getItem } from "@/api/useGetItem";

export type CheckDocumentFunction = (
  check: ReturnType<typeof PackageCheck> & { recordExists: boolean },
) => boolean;

export const documentPoller = (id: string, documentChecker: CheckDocumentFunction) =>
  new DataPoller({
    interval: 1000,
    pollAttempts: 20,
    onPoll: (data) => {
      const check = PackageCheck(data._source);

      return documentChecker({ ...check, recordExists: !!data });
    },
    fetcher: () => getItem(id),
  });
