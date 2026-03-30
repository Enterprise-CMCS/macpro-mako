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

  return notifications
    .filter((notification) => BannerNotificationSchema.safeParse(notification).success)
    .map((notification) => BannerNotificationSchema.parse(notification));
};

const getTime = (value?: string) => {
  if (!value) return null;

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

const sortByPublishedDateDesc = (a: ValidBannerNotification, b: ValidBannerNotification) => {
  const aTime = getTime(a.pubDate) ?? Number.NEGATIVE_INFINITY;
  const bTime = getTime(b.pubDate) ?? Number.NEGATIVE_INFINITY;

  return bTime - aTime;
};

const isActiveNotification = (notification: ValidBannerNotification, now: number) => {
  const pubDate = getTime(notification.pubDate);
  const expDate = getTime(notification.expDate);

  return pubDate !== null && expDate !== null && pubDate <= now && expDate > now;
};

const getNotificationStorageKey = (username?: string) =>
  username ? `notifs.${username}` : undefined;

const parseDismissedNotifications = (value: string | null): string[] => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
};

export const getSystemNotifs = async (): Promise<ValidBannerNotification[]> => {
  try {
    const notifications = await API.get("os", "/systemNotifs", {});
    return mapValidNotifications(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

export const useGetSystemNotifs = () => {
  const userQuery = useGetUser();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const username = userQuery?.data?.user?.username;

  useEffect(() => {
    const storageKey = getNotificationStorageKey(username);
    if (!storageKey) {
      setDismissed([]);
      return;
    }

    setDismissed(parseDismissedNotifications(localStorage.getItem(storageKey)));
  }, [username]);

  const result = useQuery<ValidBannerNotification[], ReactQueryApiError>(
    ["systemBannerNotifs"],
    () => getSystemNotifs(),
  );

  const now = Date.now();
  const allNotifications = [...(result.data ?? [])].sort(sortByPublishedDateDesc);
  const notDismissed = allNotifications.filter((i) => !dismissed.includes(i.notifId));
  const currentNotifs = notDismissed.filter((i) => isActiveNotification(i, now));

  const clearNotif = (id?: string) => {
    const toBeRemoved = id ?? currentNotifs?.[0]?.notifId ?? "";
    const cleared = [...dismissed, toBeRemoved].filter((v, i, a) => a.indexOf(v) === i);

    setDismissed(cleared);
    const storageKey = getNotificationStorageKey(username);
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(cleared));
    }
  };

  const resetNotifs = () => {
    setDismissed([]);
    const storageKey = getNotificationStorageKey(username);
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify([]));
    }
  };
  return {
    notifications: currentNotifs,
    dismissed: dismissed,
    allNotifications,
    clearNotif: clearNotif,
    resetNotifs: resetNotifs,
  };
};
