import { getItem } from "@/api/useGetItem";
import { DataPoller } from "./DataPoller";

export const seaStatusPoller = (
  id: string,
  statusToCheck: (data: Awaited<ReturnType<typeof getItem>>) => boolean,
) =>
  new DataPoller({
    interval: 1000,
    pollAttempts: 20,
    onPoll: statusToCheck,
    fetcher: () => getItem(id),
  });
