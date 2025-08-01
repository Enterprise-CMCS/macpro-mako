import { PlusIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { StateCode } from "shared-types";
import { Territory } from "shared-types/events/legacy-user";
import { isStateUser } from "shared-utils";

import {
  StateAccess,
  useGetUser,
  useGetUserDetails,
  useGetUserProfile,
  useSubmitRoleRequests,
} from "@/api";
import {
  banner,
  Button,
  CardWithTopBorder,
  GroupAndDivision,
  LoadingSpinner,
  RoleStatusCard,
  SubNavHeader,
  UserInformation,
  WithdrawRoleModal,
} from "@/components";
import { Option } from "@/components/Opensearch/main/Filtering/Drawer/Filterable";
import { FilterableSelect } from "@/components/Opensearch/main/Filtering/Drawer/Filterable";
import { useAvailableStates } from "@/hooks/useAvailableStates";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

import { filterRoleStatus, hasPendingRequests, orderRoleStatus, stateAccessRoles } from "../utils";

export interface SelfRevokeAcess extends StateAccess {
  isNewUserRoleDisplay: boolean;
}

export interface SelfRevokeAcess extends StateAccess {
  isNewUserRoleDisplay: boolean;
}

export const MyProfile = () => {
  const navigate = useNavigate();
  const { data: userDetails, isLoading: isDetailLoading } = useGetUserDetails();
  const { data: user } = useGetUser();
  const {
    data: userProfile,
    isLoading: isProfileLoading,
    isRefetching: isProfileRefetching,
    refetch: reloadUserProfile,
  } = useGetUserProfile();

  const isNewUserRoleDisplay = useFeatureFlag("SHOW_USER_ROLE_UPDATE");

  const { mutateAsync: submitRequest, isLoading: areRolesLoading } = useSubmitRoleRequests();

  const [selfRevokeRole, setSelfRevokeRole] = useState<SelfRevokeAcess | null>(null);

  const [showAddState, setShowAddState] = useState<boolean>(true);
  const [requestedStates, setRequestedStates] = useState<StateCode[]>([]);
  const [pendingRequests, setPendingRequests] = useState<boolean>(false);
  const statesToRequest: Option[] = useAvailableStates(userDetails?.role, userProfile?.stateAccess);

  const orderedRoleStatus = useMemo(() => {
    const filteredRoleStatus = isNewUserRoleDisplay
      ? userProfile?.stateAccess
      : filterRoleStatus(userDetails, userProfile);

    return orderRoleStatus(filteredRoleStatus);
  }, [userDetails, userProfile, isNewUserRoleDisplay]);

  const hideAddRoleButton = useMemo(() => {
    if (!userProfile || !userProfile.stateAccess) return true;

    const isCMSWithManyRoles = userProfile?.stateAccess.filter((x) => {
      if (x.role === "defaultcmsuser" || x.role === "cmsreviewer") return false;
      if (x.role.includes("cms") || x.role === "systemadmin")
        return x.status === "active" || x.status === "pending";
      return false;
    });

    const isHelpDesk = userProfile?.stateAccess.filter((x) => x.role === "helpdesk").length;
    return isCMSWithManyRoles.length || isHelpDesk;
  }, [userProfile]);

  // Set initial value of showAddState based on pending roles
  useEffect(() => {
    if (!isDetailLoading && !isProfileLoading) {
      const pendingRequests = hasPendingRequests(userProfile?.stateAccess);
      setPendingRequests(pendingRequests);
    }
  }, [isDetailLoading, isProfileLoading, userProfile, userProfile?.stateAccess]);

  if (isDetailLoading || isProfileLoading || isProfileRefetching) {
    return <LoadingSpinner />;
  }

  if (!isDetailLoading && !userDetails?.id) {
    return <Navigate to="/" />;
  }

  const StateAccessControls = () => {
    if (userDetails.role !== "statesubmitter") return null;
    if (pendingRequests) {
      return <p>State Access Requests Disabled until Role Request is finalized.</p>;
    }
    if (showAddState) {
      return <Button onClick={() => setShowAddState(false)}>Add State</Button>;
    }
    return (
      <CardWithTopBorder>
        <div className="p-8 min-h-36">
          <h3 className="text-xl font-bold">Choose State Access</h3>
          <FilterableSelect
            value={requestedStates}
            options={statesToRequest}
            onChange={(values: StateCode[]) => setRequestedStates(values)}
            selectedDisplay="label"
          />
          <div className="block lg:mt-8 lg:mb-2">
            <span>
              <Button
                disabled={!(requestedStates && requestedStates.length)}
                onClick={handleSubmitRequest}
              >
                Submit
              </Button>
              {areRolesLoading && <LoadingSpinner />}
              <Button variant="link" onClick={() => setShowAddState(true)}>
                Cancel
              </Button>
            </span>
          </div>
        </div>
      </CardWithTopBorder>
    );
  };

  const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

  const handleSubmitRequest = async () => {
    try {
      for (const state of requestedStates) {
        await submitRequest({
          email: userDetails.email,
          state,
          role: userDetails.role,
          eventType: "user-role",
          requestRoleChange: true,
        });
      }

      setShowAddState(true);
      setRequestedStates([]);
      await delay(500);
      await reloadUserProfile();

      banner({
        header: "Submission Completed",
        body: "Your submission has been received.",
        variant: "success",
        pathnameToDisplayOn: window.location.pathname,
      });
      window.scrollTo(0, 0);
    } catch (error) {
      banner({
        header: "An unexpected error has occurred:",
        body: error instanceof Error ? error.message : String(error),
        variant: "destructive",
        pathnameToDisplayOn: window.location.pathname,
      });
      window.scrollTo(0, 0);
    }
  };

  const handleSelfRevokeAccess = async () => {
    try {
      await submitRequest({
        email: userDetails.email,
        state: selfRevokeRole.territory as Territory,
        role: userDetails.role,
        eventType: "user-role",
        requestRoleChange: false,
        grantAccess: "revoked",
      });

      setSelfRevokeRole(null);
      await delay(500);
      await reloadUserProfile();

      if (isNewUserRoleDisplay) {
        banner({
          header: "Role Removed",
          body: "You have successfully removed this role from your account.",
          variant: "success",
          pathnameToDisplayOn: window.location.pathname,
        });
      } else {
        banner({
          header: "Submission Completed",
          body: "Your submission has been received.",
          variant: "success",
          pathnameToDisplayOn: window.location.pathname,
        });
      }

      window.scrollTo(0, 0);
    } catch (error) {
      banner({
        header: "An unexpected error has occurred:",
        body: error instanceof Error ? error.message : String(error),
        variant: "destructive",
        pathnameToDisplayOn: window.location.pathname,
      });
      window.scrollTo(0, 0);
    }
  };

  const handleRoleStatusClick = (access: StateAccess) => {
    setSelfRevokeRole({ isNewUserRoleDisplay, ...access });
  };

  const handleDialogOnAccept = async () => {
    if (
      !selfRevokeRole.isNewUserRoleDisplay ||
      (selfRevokeRole.status !== "pending" && selfRevokeRole.role === "statesubmitter")
    ) {
      await handleSelfRevokeAccess();
    } else if (selfRevokeRole.status !== "pending") {
      // TODO: add in logic for other users to be able to self revoke
      console.log("self revoke role");
      setSelfRevokeRole(null);
    } else {
      // TODO: add in the logic to remove pending request move state change into that function
      console.log("Withdraw pending request");
      setSelfRevokeRole(null);
    }
  };

  const showAllStateAccess = isNewUserRoleDisplay
    ? true
    : stateAccessRoles.includes(userDetails?.role);

  return (
    <>
      <SubNavHeader>
        <h1 className="text-xl font-medium">My Profile</h1>
      </SubNavHeader>

      <section className="block max-w-screen-xl m-auto px-4 lg:px-8 py-8 gap-10">
        <div className="flex flex-col md:flex-row">
          <UserInformation
            fullName={userDetails?.fullName}
            role={userDetails?.role}
            email={userDetails?.email}
            allowEdits={isNewUserRoleDisplay}
            group={userDetails.group}
            division={userDetails.division}
          />
          <div className="flex flex-col gap-6 md:basis-1/2">
            {/* Status/State Access Management Section */}
            {showAllStateAccess && (
              <div>
                {isNewUserRoleDisplay ? (
                  <h2 className="text-2xl font-bold">My User Roles</h2>
                ) : (
                  <h2 className="text-2xl font-bold">
                    {userDetails.role === "statesubmitter" ||
                    userDetails.role === "statesystemadmin"
                      ? "State Access Management"
                      : "Status"}
                  </h2>
                )}
                {/* TODO: Get state system admin for that state */}
                <WithdrawRoleModal
                  open={selfRevokeRole !== null}
                  selfRevokeRole={selfRevokeRole}
                  onAccept={handleDialogOnAccept}
                  onCancel={() => setSelfRevokeRole(null)}
                />

                {orderedRoleStatus && orderedRoleStatus.length ? (
                  orderedRoleStatus?.map((access) => (
                    <RoleStatusCard
                      key={`${access.territory}-${access.role}`}
                      access={access}
                      role={userDetails.role}
                      onClick={() => handleRoleStatusClick(access)}
                    />
                  ))
                ) : (
                  <p className="my-6">No role requested</p>
                )}
                {isNewUserRoleDisplay && !hideAddRoleButton ? (
                  <Button
                    className="w-full border-dashed p-10 text-black font-normal"
                    variant="outline"
                    onClick={() =>
                      isStateUser(user.user) ? navigate("/signup/state") : navigate("/signup")
                    }
                  >
                    Add another user role <PlusIcon className="ml-3" />
                  </Button>
                ) : (
                  <StateAccessControls />
                )}
              </div>
            )}

            {userDetails.role === "cmsroleapprover" && !isNewUserRoleDisplay && (
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
