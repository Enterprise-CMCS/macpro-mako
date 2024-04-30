import { getItem } from "@/api/useGetItem";
import { DataPoller } from "./DataPoller";
import {
  DataStateCheck,
  type CheckStatusFunction,
} from "@/features/package-actions/lib/dataStatusChecker";

export const seaStatusPoller = (
  id: string,
  statusToCheck: CheckStatusFunction,
) =>
  new DataPoller({
    interval: 1000,
    pollAttempts: 20,
    onPoll: (data) => {
      const checks = DataStateCheck(data);
      return statusToCheck(checks);
    },
    fetcher: () => getItem(id),
  });
