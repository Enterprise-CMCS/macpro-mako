import { getItem } from "@/api/useGetItem";
import { DataPoller } from "./DataPoller";
import { PackageCheck } from "shared-utils";

/** These are checks that simply can't be added into the packagecheck logic.
 * A prime example being the ability to check for the existance of the data
 * coming back. This won't work in something like PackageCheck because it is
 * already expecting data
 */
export const pollerSpecificChecks = (
  data: Awaited<ReturnType<typeof getItem>> | undefined | null,
) => {
  const recordExists = !!data;

  return {
    recordExists,
  };
};

export type CheckStatusFunction = (
  check: ReturnType<typeof PackageCheck> &
    ReturnType<typeof pollerSpecificChecks>,
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
      const pollerChecks = pollerSpecificChecks(data);

      return statusToCheck({ ...check, ...pollerChecks });
    },
    fetcher: () => getItem(id),
  });
