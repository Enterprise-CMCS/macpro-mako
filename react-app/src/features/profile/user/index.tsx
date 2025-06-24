import LZ from "lz-string";
import { useMemo } from "react";
import { LoaderFunctionArgs, redirect, useLoaderData } from "react-router";
import { userRoleMap } from "shared-utils";

import { getUserDetails, getUserProfile, OneMacUserProfile, UserDetails } from "@/api";
import { GroupAndDivision, RoleStatusCard, SubNavHeader, UserInformation } from "@/components";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

import { filterRoleStatus, orderRoleStatus } from "../utils";

type LoaderData = {
  userDetails: UserDetails;
  userProfile: OneMacUserProfile;
};

export const userProfileLoader = async ({
  params,
}: LoaderFunctionArgs): Promise<LoaderData | Response> => {
  const { profileId } = params;

  try {
    const currUserDetails = await getUserDetails();
    if (
      !currUserDetails?.role ||
      !["systemadmin", "statesystemadmin", "cmsroleapprover", "helpdesk"].includes(
        currUserDetails?.role,
      )
    ) {
      return redirect("/");
    }

    const userEmail = LZ.decompressFromEncodedURIComponent(profileId.replaceAll("_", "+"));

    if (!userEmail) return redirect("/usermanagement");

    const profileUserDetails = await getUserDetails(userEmail);
    const profileUserProfile = await getUserProfile(userEmail);

    return { userDetails: profileUserDetails, userProfile: profileUserProfile };
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error fetching profile: ", error.message);
    } else {
      console.log("Unknown error fetching profile: ", error);
    }
    return redirect("/usermanagement");
  }
};

export const UserProfile = () => {
  const { userDetails, userProfile } = useLoaderData<LoaderData>();

  const filteredRoleStatus = useMemo(
    () => filterRoleStatus(userDetails, userProfile),
    [userDetails, userProfile],
  );

  const orderedRoleStatus = useMemo(
    () => orderRoleStatus(filteredRoleStatus),
    [filteredRoleStatus],
  );

  const isNewUserRoleDisplay = useFeatureFlag("SHOW_USER_ROLE_UPDATE");

  return (
    <>
      <SubNavHeader>
        <h1 className="text-xl font-medium">User Profile</h1>
      </SubNavHeader>

      <section className="block max-w-screen-xl m-auto px-4 lg:px-8 py-8 gap-10">
        <div className="flex flex-col md:flex-row">
          <UserInformation
            fullName={userDetails?.fullName || "Unknown"}
            role={userRoleMap[userDetails?.role]}
            email={userDetails?.email}
          />
          <div className="flex flex-col gap-6 md:basis-1/2">
            <div>
              <h2 className="text-2xl font-bold">
                {userDetails.role === "statesubmitter" || userDetails.role === "statesystemadmin"
                  ? "State Access Management"
                  : "Status"}
              </h2>
              {orderedRoleStatus?.map((access) => (
                <RoleStatusCard
                  isNewUserRoleDisplay={isNewUserRoleDisplay}
                  role={userDetails.role}
                  access={access}
                  key={access.id}
                />
              ))}
            </div>

            {userDetails.role === "cmsroleapprover" && (
              <GroupAndDivision
                group={userDetails.group}
                division={userDetails.division}
                role={userDetails.role}
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
};
