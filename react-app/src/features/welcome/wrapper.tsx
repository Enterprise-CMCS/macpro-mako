import { isCmsUser } from "shared-utils";

import { useGetUser } from "@/api";
import * as F from "@/features";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

export const WelcomeWrapper = () => {
  const { data: user } = useGetUser();
  const isEnabled = useFeatureFlag("CMS_HOMEPAGE_FLAG");

  // Check if the user exists and has a CMS role
  return user && isCmsUser(user.user) && isEnabled ? <F.CMSWelcome /> : <F.Welcome />;

  // Uncomment to test the CMSWelcome component:
  // return <F.CMSWelcome />;
};
