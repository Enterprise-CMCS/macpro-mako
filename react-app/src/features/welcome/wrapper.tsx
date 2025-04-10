import { isCmsUser, isStateUser } from "shared-utils";

import { useGetUser } from "@/api";
import * as F from "@/features";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

export const WelcomeWrapper = () => {
  const { data: user } = useGetUser();
  const isEnabled = useFeatureFlag("CMS_HOMEPAGE_FLAG");

  // Check if the user exists and has a CMS role
  if (user && isCmsUser(user.user) && isEnabled) {
    return <F.CMSWelcome />;
  }
  // Check if the user exists and has a State role
  if (user && isStateUser(user.user) && isEnabled) {
    return <F.StateWelcome />;
  }

  // If user is not logged in, show the default welcome page
  return <F.Welcome />;
};
