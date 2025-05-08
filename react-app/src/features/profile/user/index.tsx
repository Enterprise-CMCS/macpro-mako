import LZ from "lz-string";
import { useMemo } from "react";
import { LoaderFunctionArgs, redirect, useLoaderData } from "react-router";

import { getUserDetails, getUserProfile, OneMacUserProfile, UserDetails } from "@/api";
import { GroupAndDivision, StateAccessCard, SubNavHeader, UserInformation } from "@/components";

import { filterStateAccess, orderStateAccess, userRoleMap } from "../utils";

type LoaderData = {
  userDetails: UserDetails;
  userProfile: OneMacUserProfile;
};

export const userProfileLoader = async ({
  params,
}: LoaderFunctionArgs): Promise<LoaderData | Response> => {
  const { profileId } = params;

  if (!profileId) return redirect("/usermanagement");

  try {
    const currUserDetails = await getUserDetails();
    if (
      !currUserDetails?.role ||
      !["systemadmin", "statesystemadmin", "cmsroleapprover", "helpdesk"].includes(
        currUserDetails?.role,
      )
    ) {
      return redirect("/usermanagement");
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

  const filteredStateAccess = useMemo(
    () => filterStateAccess(userDetails, userProfile),
    [userDetails, userProfile],
  );

  const orderedStateAccess = useMemo(
    () => orderStateAccess(filteredStateAccess),
    [filteredStateAccess],
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
          <div className="flex flex-col gap-6 md:basis-1/2">
            <div>
              <h2 className="text-2xl font-bold">
                {userDetails.role === "statesubmitter" || userDetails.role === "statesystemadmin"
                  ? "State Access Management"
                  : "Status"}
              </h2>
              {orderedStateAccess?.map((access) => (
                <StateAccessCard access={access} role={userDetails.role} key={access.id} />
              ))}
            </div>

            <GroupAndDivision
              group={userDetails.group}
              division={userDetails.division}
              role={userDetails.role}
            />
          </div>
        </div>
      </section>
    </>
  );
};
