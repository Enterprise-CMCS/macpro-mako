import { useQuery } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import {
  BannerNotificationSchema,
  ReactQueryApiError,
  ValidBannerNotification,
} from "shared-types";

import { useGetUser } from "@/api";

const mapValidNotifications = (notifications: unknown[]): ValidBannerNotification[] => {
  if (!Array.isArray(notifications)) return [];
  console.log(notifications);
  return notifications
    .filter((notification) => BannerNotificationSchema.safeParse(notification).success)
    .map((notification) => BannerNotificationSchema.parse(notification));
};

export const getSystemNotifs = async (): Promise<ValidBannerNotification[]> => {
  try {
    const notifications = await API.get("os", "/systemNotifs", {});
    console.log("notifications");
    console.log(notifications);
    return mapValidNotifications(notifications);
  } catch (error) {
    console.log("hello");
    console.error("Error fetching notifications:", error);
    return [];
  }
};

export const useGetSystemNotifs = () => {
  const userQuery = useGetUser();
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    const dismissedNotifs = localStorage.getItem(`notifs.${userQuery?.data?.user?.username}`);
    const parsed: string[] = JSON.parse(dismissedNotifs) ?? [];
    setDismissed(parsed);
  }, [userQuery?.data?.user?.username]);

  const result = useQuery<ValidBannerNotification[], ReactQueryApiError>(
    ["systemBannerNotifs"],
    () => getSystemNotifs(),
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
