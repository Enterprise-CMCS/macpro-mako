import { useState, useEffect } from "react";
import { useGetUser } from "@/api";

type NotifHook = () => {
  dismissed: string[];
  clearNotif: (id: string) => void;
  resetNotifs: () => void;
};

export const useNotifs: NotifHook = () => {
  const userQuery = useGetUser();
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    const dismissedNotifs = localStorage.getItem(`notifs.${userQuery?.data?.user?.username}`);
    const parsed: string[] = JSON.parse(dismissedNotifs) ?? [];
    setDismissed(parsed);
  }, [userQuery]);

  const clearNotif = (id: string) => {
    const cleared = [...dismissed, id].filter((v, i, a) => a.indexOf(v) === i);

    setDismissed(cleared);
    localStorage.setItem(`notifs.${userQuery?.data?.user?.username}`, cleared.toString());
  };

  const resetNotifs = () => {
    setDismissed([]);
    localStorage.setItem(`notifs.${userQuery?.data?.user?.username}`, [].toString());
  };

  return {
    dismissed,
    clearNotif,
    resetNotifs,
  };
};
