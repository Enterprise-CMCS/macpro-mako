import { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { StateCode } from "shared-types";
import { UserRole } from "shared-types/events/legacy-user";
import { userRoleMap } from "shared-utils";

import { useGetUserDetails, useGetUserProfile, useSubmitRoleRequests } from "@/api";
import {
  banner,
  Button,
  ConfirmationDialog,
  LoadingSpinner,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SimplePageContainer,
  SubNavHeader,
} from "@/components";
import { FilterableSelect, Option } from "@/components/Opensearch/main/Filtering/Drawer/Filterable";
import { useAvailableStates } from "@/hooks/useAvailableStates";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

export const StateSignup = () => {
  const isNewUserRoleDisplay = useFeatureFlag("SHOW_USER_ROLE_UPDATE");

  const [stateSelected, setStateSelected] = useState<StateCode[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const navigate = useNavigate();
  const { mutateAsync: submitRequest, isLoading } = useSubmitRoleRequests();
  const { data: userDetails, isLoading: isUserDetailsLoading } = useGetUserDetails();
  const { data: userProfile, isLoading: isUserProfileLoading } = useGetUserProfile();
  const currentRole = userDetails?.role;

  const [searchParams] = useSearchParams();
  const roleKey = searchParams.get("role") as UserRole;

  // Determine which role the user is allowed to request based on their current role
  const roleToRequestMap: Partial<Record<UserRole, UserRole>> = {
    norole: roleKey,
    statesubmitter: "statesystemadmin",
    statesystemadmin: "statesubmitter",
  };
  const roleToRequest = roleToRequestMap[currentRole];
  const statesToRequest: Option[] = useAvailableStates(roleToRequest, userProfile?.stateAccess);

  if (isUserDetailsLoading || isUserProfileLoading) return <LoadingSpinner />;

  if (!userDetails?.role) return <Navigate to="/" />;

  // Only state users can access this page
  if (
    currentRole !== "statesubmitter" &&
    currentRole !== "statesystemadmin" &&
    currentRole !== "norole"
  )
    return <Navigate to="/profile" />;

  const onChange = (values: StateCode[]) => {
    setStateSelected(values);
  };

  const onSubmit = async () => {
    try {
      for (const state of stateSelected) {
        await submitRequest({
          email: userDetails.email,
          state,
          role: roleToRequest,
          eventType: "user-role",
          requestRoleChange: true,
        });
      }
      const redirectRoute = currentRole === "norole" ? "/profile" : "/dashboard";
      navigate(redirectRoute);
      banner({
        header: "Submission Completed",
        body: "Your submission has been received.",
        variant: "success",
        pathnameToDisplayOn: redirectRoute,
      });
    } catch (error) {
      console.error(error);
      banner({
        header: "An unexpected error has occurred:",
        body: error instanceof Error ? error.message : String(error),
        variant: "destructive",
        pathnameToDisplayOn: window.location.pathname,
      });
    }
  };

  return (
    <div>
      <SubNavHeader>
        <h1 className="text-xl font-medium">
          {isNewUserRoleDisplay ? "Choose States For Access" : "Registration: State Access"}
        </h1>
      </SubNavHeader>
      <ConfirmationDialog
        open={showModal}
        title="Cancel role request?"
        body="Changes you made will not be saved."
        onAccept={() => navigate(isNewUserRoleDisplay ? "/profile" : "/signup")}
        onCancel={() => setShowModal(false)}
        cancelButtonText="Stay on Page"
        acceptButtonText="Confirm"
      />
      <SimplePageContainer>
        <div className="flex justify-center p-5">
          <div className="w-1/3">
            {!isNewUserRoleDisplay && (
              <div className="py-2">
                <h2 className="text-xl font-bold mb-2">User Role:</h2>
                <p className="text-xl italic">{userRoleMap[roleToRequest] ?? "Not Found"}</p>
              </div>
            )}
            <div className="py-2">
              <h2 className="text-xl font-bold mb-2">Select your State Access</h2>
              {isNewUserRoleDisplay && (
                <FilterableSelect
                  value={stateSelected}
                  options={statesToRequest}
                  onChange={(values: StateCode[]) => onChange(values)}
                  placeholder="Select state here"
                  selectedDisplay="value"
                />
              )}
              {!isNewUserRoleDisplay &&
                (roleToRequest === "statesystemadmin" ? (
                  <Select onValueChange={(value: StateCode) => onChange([value])}>
                    <SelectTrigger aria-label="Select state">
                      <SelectValue placeholder="Select state here" />
                    </SelectTrigger>
                    <SelectContent isScrollable>
                      {statesToRequest.map((state) => (
                        <SelectItem value={state.value} key={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <FilterableSelect
                    value={stateSelected}
                    options={statesToRequest}
                    onChange={(values: StateCode[]) => onChange(values)}
                    placeholder="Select state here"
                    selectedDisplay="label"
                  />
                ))}
              {!stateSelected.length && (
                <p className="text-red-600 mt-3">
                  {roleToRequest === "statesystemadmin"
                    ? "Please select a state."
                    : "Please select at least one state."}
                </p>
              )}
              <div className="py-4">
                {isNewUserRoleDisplay ? (
                  <Button
                    className="mr-3"
                    disabled={!stateSelected.length}
                    onClick={() => {
                      const stateParam = encodeURIComponent(stateSelected.join(","));
                      navigate(`/signup/state/role?states=${stateParam}`);
                    }}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button className="mr-3" disabled={!stateSelected.length} onClick={onSubmit}>
                    Submit
                  </Button>
                )}
                {isLoading && <LoadingSpinner />}
                <Button
                  variant={isNewUserRoleDisplay ? "link" : "outline"}
                  onClick={() => setShowModal(true)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SimplePageContainer>
    </div>
  );
};
