import { useQuery } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { useEffect, useState } from "react";
import { BannerNotification, ReactQueryApiError } from "shared-types";

import { useGetUser } from "@/api";

export type Notification = {
  notifId: string;
  body: string;
  header: string;
  pubDate: string;
  expDate: string;
  buttonLink: string;
  buttonText: string;
  disabled?: boolean;
};

const mapNotifications = (notifications: any): Notification[] => {
  return notifications.flatMap((notification) => {
    if (Array.isArray(notification.body)) {
      return notification.body.map((entry: any, index: any) => ({
        notifId: `${notification.notifId}-${index}`,
        body: `${entry.date}: ${entry.title} - ${entry.description}`,
        header: notification.header,
        pubDate: notification.pubDate,
        expDate: notification.expDate,
        buttonText: notification.buttonText,
        buttonLink: notification.buttonLink || "",
        disabled: notification.disabled ?? false,
      }));
    }
    return notification;
  });
};
export const getSystemNotifs = async (): Promise<BannerNotification[]> => {
  const notifications = await API.get("os", "/systemNotifs", {});
  const mappedNotifications = mapNotifications(notifications);
  return mappedNotifications;
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
