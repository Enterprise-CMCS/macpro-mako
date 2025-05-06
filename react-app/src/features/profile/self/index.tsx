import { XIcon } from "lucide-react";
import { useState } from "react";
import { Navigate } from "react-router";
import { StateCode } from "shared-types";

import { StateAccess, useGetUserDetails, useGetUserProfile, useSubmitRoleRequests } from "@/api";
import {
  banner,
  Button,
  CardWithTopBorder,
  ConfirmationDialog,
  LoadingSpinner,
  StateAccessCard,
  SubNavHeader,
  UserInformation,
} from "@/components";
import { Option } from "@/components/Opensearch/main/Filtering/Drawer/Filterable";
import { FilterableSelect } from "@/components/Opensearch/main/Filtering/Drawer/Filterable";
import { useAvailableStates } from "@/hooks/useAvailableStates";

import { adminRoles, orderStateAccess, userRoleMap } from "../utils";

export const Profile = () => {
  const { data: userDetails, isLoading: isDetailLoading } = useGetUserDetails();
  const {
    data: userProfile,
    isLoading: isProfileLoading,
    refetch: reloadUserProfile,
  } = useGetUserProfile();
  const { mutateAsync: submitRequest, isLoading: areRolesLoading } = useSubmitRoleRequests();
  const [selfRevokeState, setSelfRevokeState] = useState<StateCode | null>(null);
  const [showAddState, setShowAddState] = useState<boolean>(true);
  const [requestedStates, setRequestedStates] = useState<StateCode[]>([]);
  const statesToRequest: Option[] = useAvailableStates(userProfile?.stateAccess);

  if (isDetailLoading || isProfileLoading) {
    return <LoadingSpinner />;
  }

  if (!isDetailLoading && !userDetails?.id) {
    return <Navigate to="/" />;
  }

  // if user has no active roles, show pending state(s)
  // show state(s) for latest active role
  const stateAccess = () => {
    const statesToShow = userDetails.role
      ? userProfile?.stateAccess?.filter(
          (access: StateAccess) => access.role === userDetails.role && access.territory !== "ZZ",
        )
      : userProfile?.stateAccess?.filter((access: StateAccess) => access.territory !== "ZZ");

    return orderStateAccess(statesToShow);
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
      console.error(error);
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
        grantAccess: false,
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
      console.error(error);
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
          {/* State Access Management Section */}
          {adminRoles.includes(userDetails?.role) && (
            <div className="flex flex-col gap-6 md:basis-1/2">
              <h2 className="text-2xl font-bold">State Access Management</h2>
              {/* TODO: Get state system admin for that state */}
              <ConfirmationDialog
                open={selfRevokeState !== null}
                title="Withdraw State Access?"
                body={"This action cannot be undone. State System Admin will be notified."}
                acceptButtonText="Confirm"
                aria-labelledby="Self Revoke Access Modal"
                onAccept={handleSelfRevokeAccess}
                onCancel={() => setSelfRevokeState(null)}
              />
              {stateAccess().map((access) => (
                <StateAccessCard
                  access={access}
                  role={userRoleMap[userDetails?.role]}
                  onClick={() => setSelfRevokeState(access.territory as StateCode)}
                />
              ))}
              {userDetails?.role === "statesubmitter" &&
                (showAddState ? (
                  <Button onClick={() => setShowAddState(false)}>Add State</Button>
                ) : (
                  <CardWithTopBorder>
                    <div className="p-8 min-h-36">
                      <h3 className="text-xl font-bold">Choose State Access</h3>
                      <FilterableSelect
                        value={requestedStates}
                        options={statesToRequest}
                        onChange={(values: StateCode[]) => setRequestedStates(values)}
                      />
                      <div className="block lg:mt-8 lg:mb-2">
                        <span>
                          <Button onClick={handleSubmitRequest}>Submit</Button>
                          {areRolesLoading && <LoadingSpinner />}
                          <Button variant="link" onClick={() => setShowAddState(true)}>
                            Cancel
                          </Button>
                        </span>
                      </div>
                    </div>
                  </CardWithTopBorder>
                ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};
