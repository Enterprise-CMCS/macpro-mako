import { useMemo } from "react";
import { useParams } from "react-router";
import { Navigate } from "react-router";

import { useGetUserDetails, useGetUserProfile } from "@/api";
import { LoadingSpinner, StateAccessCard, SubNavHeader, UserInformation } from "@/components";

import { adminRoles, getStateAccess, userRoleMap } from "../utils";

export const UserProfile = () => {
  const { profileId } = useParams();
  const { data: userDetails, isLoading: isDetailLoading } = useGetUserDetails();

  if (isDetailLoading) {
    return <LoadingSpinner />;
  }

  if (
    !userDetails?.id ||
    !["systemadmin", "statesystemadmin", "cmsroleapprover", "helpdesk"].includes(userDetails?.role)
  ) {
    return <Navigate to="/" />;
  }

  return <Profile profileId={profileId} />;
};

const Profile = ({ profileId }: { profileId: string }) => {
  const { data: userDetails, isLoading: isDetailLoading } = useGetUserDetails(profileId);
  const { data: userProfile, isLoading: isProfileLoading } = useGetUserProfile(profileId);

  const stateAccess = useMemo(
    () => getStateAccess(userDetails, userProfile),
    [userDetails, userProfile],
  );

  if (isDetailLoading || isProfileLoading) return <LoadingSpinner />;
  return (
    <>
      <SubNavHeader>
        <h1 className="text-xl font-medium">User Profile</h1>
      </SubNavHeader>

      <section className="block max-w-screen-xl m-auto px-4 lg:px-8 py-8 gap-10">
        <div className="flex flex-col md:flex-row">
          <UserInformation
            fullName={userDetails?.fullName}
            role={userRoleMap[userDetails?.role]}
            email={userDetails?.email}
          />
          {/* State Access Management Section */}
          {adminRoles.includes(userDetails?.role) && (
            <div className="flex flex-col gap-6 md:basis-1/2">
              <h2 className="text-2xl font-bold">State Access Management</h2>
              {stateAccess.map((access) => (
                <StateAccessCard access={access} role={userRoleMap[userDetails?.role]} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};
