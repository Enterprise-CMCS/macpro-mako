import LZ from "lz-string";
import { useMemo } from "react";
import { LoaderFunctionArgs, redirect, useLoaderData } from "react-router";

import { getUserDetails, getUserProfile, OneMacUserProfile, UserDetails } from "@/api";
import { StateAccessCard, SubNavHeader, UserInformation } from "@/components";

import { adminRoles, getStateAccess, userRoleMap } from "../utils";

type LoaderData = {
  userDetails: UserDetails;
  userProfile: OneMacUserProfile;
};

export const userProfileLoader = async ({
  params,
}: LoaderFunctionArgs): Promise<LoaderData | Response> => {
  const { profileId } = params;
  console.log({ profileId });

  if (!profileId) return redirect("/usermanagement");

  try {
    const currUserDetails = await getUserDetails();
    console.log({ currUserDetails });
    if (
      !currUserDetails?.role ||
      !["systemadmin", "statesystemadmin", "cmsroleapprover", "helpdesk"].includes(
        currUserDetails?.role,
      )
    ) {
      return redirect("/usermanagement");
    }

    const userEmail = LZ.decompressFromEncodedURIComponent(profileId.replaceAll("_", "+"));
    console.log({ userEmail });

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

  const stateAccess = useMemo(
    () => getStateAccess(userDetails, userProfile),
    [userDetails, userProfile],
  );

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
          {/* State Access Management Section */}
          {adminRoles.includes(userDetails?.role) && (
            <div className="flex flex-col gap-6 md:basis-1/2">
              <h2 className="text-2xl font-bold">State Access Management</h2>
              {stateAccess?.map((access) => (
                <StateAccessCard
                  access={access}
                  role={userRoleMap[userDetails?.role]}
                  key={access.id}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};
