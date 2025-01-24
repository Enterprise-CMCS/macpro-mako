import { API } from "aws-amplify";
import { useState, useEffect } from "react";
import { useGetUser } from "@/api";
import { useQuery } from "@tanstack/react-query";
import { BannerNotification, ReactQueryApiError } from "shared-types";

export const getSystemNotifs = async (): Promise<BannerNotification[]> => {
  return await API.get("os", "/systemNotifs", {});
};

export const useGetSystemNotifs = () => {
  const userQuery = useGetUser();
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    const dismissedNotifs = localStorage.getItem(`notifs.${userQuery?.data?.user?.username}`);
    const parsed: string[] = JSON.parse(dismissedNotifs) ?? [];
    setDismissed(parsed);
  }, [userQuery?.data?.user?.username]);

  const result = useQuery<BannerNotification[], ReactQueryApiError>(["systemBannerNotifs"], () =>
    getSystemNotifs(),
  );

  const notDismissed = result.data?.filter((i) => !dismissed.includes(i.notifId)) ?? []; //check dismissed
  const currentNotifs = notDismissed.filter(
    (i) => i.expDate && new Date(i.expDate).getTime() > new Date().getTime(),
  ); //check expired

  const clearNotif = (id?: string) => {
    const toBeRemoved = id ?? currentNotifs?.[0]?.notifId ?? "";
    const cleared = [...dismissed, toBeRemoved].filter((v, i, a) => a.indexOf(v) === i);

    setDismissed(cleared);
    localStorage.setItem(`notifs.${userQuery?.data?.user?.username}`, JSON.stringify(cleared));
  };

  const resetNotifs = () => {
    setDismissed([]);
    localStorage.setItem(`notifs.${userQuery?.data?.user?.username}`, JSON.stringify([]));
  };
  return {
    notifications: currentNotifs,
    dismissed: dismissed,
    allNotifications: result.data ?? [],
    clearNotif: clearNotif,
    resetNotifs: resetNotifs,
  };
};
