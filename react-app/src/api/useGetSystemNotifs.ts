import { API } from "aws-amplify";
import { useQuery } from "@tanstack/react-query";
import { BannerNotification, ReactQueryApiError } from "shared-types";

export const getSystemNotifs = async (): Promise<BannerNotification[]> => {
  const form = await API.get("os", "/systemNotifs", {});

  return form;
};

export const useGetSystemNotifs = () => {
  return useQuery<BannerNotification[], ReactQueryApiError>(["systemBannerNotifs"], () =>
    getSystemNotifs(),
  );
};
