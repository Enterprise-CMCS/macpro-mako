import { useState } from "react";
import { FULL_CENSUS_STATES, RoleDescriptionStrings, StateCode } from "shared-types";

import { useGetUser, useGetUserDetails, useGetUserProfile, useSubmitRoleRequests } from "@/api";
import {
  Alert,
  banner,
  Button,
  CardWithTopBorder,
  LoadingSpinner,
  SubNavHeader,
} from "@/components";
import { Option } from "@/components/Opensearch/main/Filtering/Drawer/Filterable";
import { FilterableSelect } from "@/components/Opensearch/main/Filtering/Drawer/Filterable";
import config from "@/config";
import { convertStateAbbrToFullName, stateAccessStatus } from "@/utils";

const roleMap = {
  defaultcmsuser: "Default CMS User Placeholder",
  cmsroleapprover: "CMS Role Approver",
  cmsreviewer: "CMS Reviewer",
  statesystemadmin: "State System Admin",
  helpdesk: "Helpdesk",
  statesubmitter: "State Submitter",
};

const adminRoles = ["statesubmitter", "statesystemadmin"];

export const Profile = () => {
  const { data: userDetails } = useGetUserDetails();
  const { data: userProfile, refetch: reloadUserProfile } = useGetUserProfile();

  const stateAccess = userProfile?.stateAccess?.filter((access) => access.territory != "ZZ");

  const [showAddState, setShowAddState] = useState<boolean>(true);
  const [requestedStates, setRequestedStates] = useState<StateCode[]>([]);

  const hasStateAccess = Array.isArray(stateAccess) && stateAccess.length > 0;

  const statesToRequest: Option[] = FULL_CENSUS_STATES.filter(({ value }) => {
    if (!hasStateAccess) return true;
    const isAlreadyRequested = stateAccess.some(({ territory }) => territory === value);
    return !isAlreadyRequested && value !== "ZZ";
  }).map(({ label, value }) => ({ label, value }));

  const { mutateAsync: submitRequest, isLoading } = useSubmitRoleRequests();

  const handleSubmitRequest = async () => {
    try {
      for (const state of requestedStates) {
        await submitRequest({
          email: userDetails.email,
          state,
          role: userDetails.role,
          eventType: "user-role",
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

  return (
    <>
      <SubNavHeader>
        <h1 className="text-xl font-medium">My Profile</h1>
      </SubNavHeader>

      <section className="block max-w-screen-xl m-auto px-4 lg:px-8 py-8 gap-10">
        <Alert className="mb-6 bg-sky-50 flex flex-row">
          <div className="py-1 mr-2 flex-none w-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-8 h-8"
            >
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div className="py-2 flex-1 mr-4">
            All changes to your access or profile must be made in IDM.
          </div>
          <a href={config.idm.home_url} target="_blank" rel="noreferrer">
            <Button variant="outline">Go to IDM</Button>
          </a>
        </Alert>

        <div className="flex flex-col md:flex-row">
          <div className="flex flex-col gap-6 md:basis-1/2">
            <h2 className="text-2xl font-bold">My Information</h2>

            <div className="leading-9">
              <h3 className="font-bold">Full Name</h3>
              <p>{userDetails?.fullName}</p>
            </div>

            <div className="leading-9">
              <h3 className="font-bold">Role</h3>
              <p>{roleMap[userDetails?.role]}</p>
            </div>

            <div className="leading-9">
              <h3 className="font-bold">Email</h3>
              <p>{userDetails?.email}</p>
            </div>
          </div>
          {/* State Access Management Section */}
          {adminRoles.includes(userDetails?.role) && (
            <div className="flex flex-col gap-6 md:basis-1/2">
              <h2 className="text-2xl font-bold">State Access Management</h2>
              {stateAccess?.map((access) => {
                return (
                  <CardWithTopBorder className="my-0" key={`${access.territory}-${access.role}`}>
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
                          {isLoading && <LoadingSpinner />}
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
