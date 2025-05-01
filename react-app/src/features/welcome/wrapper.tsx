import { isCmsUser, isStateUser } from "shared-utils";

import { useGetUser } from "@/api";
import * as F from "@/features";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

export const WelcomeWrapper = () => {
  const { data: user } = useGetUser();
  const isCMSEnabled = useFeatureFlag("CMS_HOMEPAGE_FLAG");
  const isStateEnabled = useFeatureFlag("STATE_HOMEPAGE_FLAG");

  if (user) {
    // Check if the user exists and has a CMS role, cms feature flag
    if (isCmsUser(user.user) && isCMSEnabled) {
      return <F.CMSWelcome />;
    }

    // Check if the user exists and has a State role, state feature flag
    if (isStateUser(user.user) && isStateEnabled) {
      return <F.StateWelcome />;
    }
  }

  // If user is not logged in, show the default welcome page
  return <F.Welcome />;
};
