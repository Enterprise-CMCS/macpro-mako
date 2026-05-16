import { PackageCheck } from "shared-utils";

import { getItem } from "@/api/useGetItem";

import { DataPoller } from "./DataPoller";

export type CheckDocumentFunction = (
  check: ReturnType<typeof PackageCheck> & { recordExists: boolean },
) => boolean;

type DocumentPollerOptions = {
  includeDraft?: boolean;
};

export const documentPoller = (
  id: string,
  documentChecker: CheckDocumentFunction,
  options?: DocumentPollerOptions,
) =>
  new DataPoller({
    interval: 1000,
    pollAttempts: 20,
    onPoll: (data) => {
      const check = PackageCheck(data._source);

      return documentChecker({ ...check, recordExists: !!data });
    },
    fetcher: () => getItem(id, { includeDraft: options?.includeDraft }),
  });
