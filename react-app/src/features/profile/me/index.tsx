import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router";
import { StateCode } from "shared-types";

import {
  useGetApprovers,
  useGetUserDetails,
  useGetUserProfile,
  useSubmitRoleRequests,
} from "@/api";
import {
  banner,
  Button,
  CardWithTopBorder,
  ConfirmationDialog,
  GroupAndDivision,
  LoadingSpinner,
  StateAccessCard,
  SubNavHeader,
  UserInformation,
} from "@/components";
import { Option } from "@/components/Opensearch/main/Filtering/Drawer/Filterable";
import { FilterableSelect } from "@/components/Opensearch/main/Filtering/Drawer/Filterable";
import { useAvailableStates } from "@/hooks/useAvailableStates";
import { convertStateAbbrToFullName } from "@/utils";

import {
  filterStateAccess,
  hasPendingRequests,
  orderStateAccess,
  stateAccessRoles,
  userRoleMap,
} from "../utils";

export const MyProfile = () => {
  const { data: userDetails, isLoading: isDetailLoading } = useGetUserDetails();
  const {
    data: userProfile,
    isLoading: isProfileLoading,
    refetch: reloadUserProfile,
  } = useGetUserProfile();

  const { mutateAsync: submitRequest, isLoading: areRolesLoading } = useSubmitRoleRequests();
  const { data: approverList, isLoading: approversLoading } = useGetApprovers();

  const [selfRevokeState, setSelfRevokeState] = useState<StateCode | null>(null);
  const [showAddState, setShowAddState] = useState<boolean>(true);
  const [requestedStates, setRequestedStates] = useState<StateCode[]>([]);
  const [pendingRequests, setPendingRequests] = useState<boolean>(false);
  const statesToRequest: Option[] = useAvailableStates(userDetails?.role, userProfile?.stateAccess);

  const filteredStateAccess = useMemo(
    () => filterStateAccess(userDetails, userProfile),
    [userDetails, userProfile],
  );

  const orderedStateAccess = useMemo(
    () => orderStateAccess(filteredStateAccess),
    [filteredStateAccess],
  );

  useEffect(() => {
    console.log("APPROVERS", approverList);
  }, [approverList, approversLoading]);

  // Set initial value of showAddState based on pending roles
  useEffect(() => {
    if (!isDetailLoading && !isProfileLoading) {
      const pendingRequests = hasPendingRequests(userProfile?.stateAccess);
      setPendingRequests(pendingRequests);
    }
  }, [isDetailLoading, isProfileLoading, filteredStateAccess, userProfile]);

  if (isDetailLoading || isProfileLoading) {
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
              <Button disabled={!requestedStates.length} onClick={handleSubmitRequest}>
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
        state: selfRevokeState,
        role: userDetails.role,
        eventType: "user-role",
        requestRoleChange: false,
        grantAccess: "revoked",
      });

      setSelfRevokeState(null);
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

  return (
    <>
      <SubNavHeader>
        <h1 className="text-xl font-medium">My Profile</h1>
      </SubNavHeader>

      <section className="block max-w-screen-xl m-auto px-4 lg:px-8 py-8 gap-10">
        <div className="flex flex-col md:flex-row">
          <UserInformation
            fullName={userDetails?.fullName}
            role={userRoleMap[userDetails?.role]}
            email={userDetails?.email}
          />
          <div className="flex flex-col gap-6 md:basis-1/2">
            {/* Status/State Access Management Section */}
            {stateAccessRoles.includes(userDetails?.role) && (
              <div>
                <h2 className="text-2xl font-bold">
                  {userDetails.role === "statesubmitter" || userDetails.role === "statesystemadmin"
                    ? "State Access Management"
                    : "Status"}
                </h2>
                {/* TODO: Get state system admin for that state */}
                <ConfirmationDialog
                  open={selfRevokeState !== null}
                  title="Withdraw State Access?"
                  body={`This action cannot be undone. ${convertStateAbbrToFullName(selfRevokeState)} State System Admin will be notified.`}
                  acceptButtonText="Confirm"
                  aria-labelledby="Self Revoke Access Modal"
                  onAccept={handleSelfRevokeAccess}
                  onCancel={() => setSelfRevokeState(null)}
                />
                {orderedStateAccess?.map((access) => (
                  <StateAccessCard
                    key={`${access.territory}`}
                    access={access}
                    role={userDetails.role}
                    onClick={() => setSelfRevokeState(access.territory as StateCode)}
                  />
                ))}
                <StateAccessControls />
              </div>
            )}

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
