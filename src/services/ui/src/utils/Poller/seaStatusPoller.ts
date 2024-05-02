import { getItem } from "@/api/useGetItem";
import { DataPoller } from "./DataPoller";
import { PackageCheck } from "shared-utils";

export type CheckStatusFunction = (
  check: ReturnType<typeof PackageCheck> & { recordExists: boolean },
) => boolean;

export const seaStatusPoller = (
  id: string,
  statusToCheck: CheckStatusFunction,
) =>
  new DataPoller({
    interval: 1000,
    pollAttempts: 20,
    onPoll: (data) => {
      const check = PackageCheck(data._source);

      return statusToCheck({ ...check, recordExists: !!data });
    },
    fetcher: () => getItem(id),
  });
