import React from "react";

// import { isCmsUser } from "shared-utils";
// import { useGetUser } from "@/api";
import * as F from "@/features";

export const WelcomeWrapper = () => {
  // const { data: user } = useGetUser();

  // Check if the user exists and has a CMS role
  // return user && isCmsUser(user.user) ? <F.CMSWelcome /> : <F.Welcome />;

  // Uncomment to test the CMSWelcome component:
  return <F.CMSWelcome />;
};
