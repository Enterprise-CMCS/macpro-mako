export * from "./self";
export * from "./admin";
export * from "./utils";
import { XIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router";
import { StateCode } from "shared-types";

import { StateAccess, useGetUserDetails, useGetUserProfile, useSubmitRoleRequests } from "@/api";
import {
  banner,
  Button,
  CardWithTopBorder,
  ConfirmationDialog,
  LoadingSpinner,
  SubNavHeader,
} from "@/components";
import { Option } from "@/components/Opensearch/main/Filtering/Drawer/Filterable";
import { FilterableSelect } from "@/components/Opensearch/main/Filtering/Drawer/Filterable";
import { useAvailableStates } from "@/hooks/useAvailableStates";
import { convertStateAbbrToFullName, stateAccessStatus } from "@/utils";

export const userRoleMap = {
  defaultcmsuser: "CMS Read-only User",
  cmsroleapprover: "CMS Role Approver",
  cmsreviewer: "CMS Reviewer",
  statesystemadmin: "State System Admin",
  helpdesk: "Helpdesk",
  statesubmitter: "State Submitter",
  systemadmin: "System Admin",
};

const adminRoles = ["statesubmitter", "statesystemadmin"];

const orderStateAccess = (accesses: StateAccess[]) => {
  if (!accesses || !accesses.length) return;
  // sort revoked states seprately and add to
  const activeStates = accesses.filter((x: StateAccess) => x.status != "revoked");
  const revokedStates = accesses.filter((x: StateAccess) => x.status == "revoked");

  const compare = (a: StateAccess, b: StateAccess) => {
    const stateA = convertStateAbbrToFullName(a.territory);
    const stateB = convertStateAbbrToFullName(b.territory);

    if (stateA < stateB) return -1;
    if (stateA > stateB) return 1;
    return 0;
  };

  const sorted = activeStates.sort(compare).concat(revokedStates.sort(compare));

  return sorted;
};

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
  const [pendingStates, setPendingStates] = useState<boolean>(false);
  const statesToRequest: Option[] = useAvailableStates(userProfile?.stateAccess);

  // if user has no active roles, show pending state(s)
  // show state(s) for latest active role
  const filteredStateAccess = useMemo(() => {
    if (!userProfile?.stateAccess) return [];
    return userDetails?.role
      ? userProfile.stateAccess.filter(
          (access) => access.role === userDetails.role && access.territory !== "ZZ",
        )
      : userProfile.stateAccess.filter((access) => access.territory !== "ZZ");
  }, [userDetails?.role, userProfile?.stateAccess]);

  const orderedStateAccess = useMemo(
    () => orderStateAccess(filteredStateAccess),
    [filteredStateAccess],
  );

  // Set initial value of showAddState based on pending roles
  useEffect(() => {
    if (!isDetailLoading && !isProfileLoading) {
      const hasPendingRequests = filteredStateAccess.some((access) => access.status === "pending");
      setPendingStates(hasPendingRequests);
    }
  }, [isDetailLoading, isProfileLoading, filteredStateAccess]);

  if (isDetailLoading || isProfileLoading) {
    return <LoadingSpinner />;
  }

  if (!isDetailLoading && !userDetails?.id) {
    return <Navigate to="/" />;
  }

  const renderStateAccessControls = () => {
    if (userDetails.role !== "statesubmitter") return null;
    if (pendingStates) {
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

      setShowAddState(false);
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
          <div className="flex flex-col gap-6 md:basis-1/2">
            <h2 className="text-2xl font-bold">My Information</h2>

            <div className="leading-9">
              <h3 className="font-bold">Full Name</h3>
              <p>{userDetails?.fullName}</p>
            </div>

            <div className="leading-9">
              <h3 className="font-bold">Role</h3>
              <p>{userRoleMap[userDetails?.role]}</p>
            </div>

            <div className="leading-9">
              <h3 className="font-bold">Email</h3>
              <p>{userDetails?.email}</p>
            </div>

            <div className="">
              <p className="italic">
                This page contains Profile Information for the {userRoleMap[userDetails?.role]}. The
                information cannot be changed in the portal.
              </p>
            </div>
          </div>
          {/* State Access Management Section */}
          {adminRoles.includes(userDetails?.role) && (
            <div className="flex flex-col gap-6 md:basis-1/2">
              <h2 className="text-2xl font-bold">State Access Management</h2>
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
              {orderedStateAccess.map((access) => {
                return (
                  <CardWithTopBorder className="my-0" key={`${access.territory}-${access.role}`}>
                    <button
                      disabled={userDetails?.role !== "statesubmitter"}
                      data-testid="self-revoke"
                      onClick={() => setSelfRevokeState(access.territory as StateCode)}
                    >
                      <XIcon size={20} />
                    </button>

                    <div className="p-8 min-h-36">
                      <h3 className="text-xl font-bold">
                        {convertStateAbbrToFullName(access.territory)}
                      </h3>
                      <p className="italic">{stateAccessStatus[access.status]}</p>
                      <p className="block lg:mt-8 lg:mb-2">
                        <span className="font-semibold">State System Admin: </span>
                        <a className="text-blue-600" href={`mailto:${access.doneByEmail}`}>
                          {access.doneByName}
                        </a>
                      </p>
                    </div>
                  </CardWithTopBorder>
                );
              })}
              {renderStateAccessControls()}
            </div>
          )}
        </div>
      </section>
    </>
  );
};
