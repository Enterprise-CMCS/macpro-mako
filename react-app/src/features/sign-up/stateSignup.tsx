import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { StateCode } from "shared-types";

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

import { userRoleMap } from "../profile";

export const StateSignup = () => {
  const [stateSelected, setStateSelected] = useState<StateCode[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const navigate = useNavigate();
  const { mutateAsync: submitRequest, isLoading } = useSubmitRoleRequests();

  const { data: userDetails } = useGetUserDetails();
  const { data: userProfile } = useGetUserProfile();
  const statesToRequest: Option[] = useAvailableStates(userProfile?.stateAccess);

  if (!userDetails) return <LoadingSpinner />;

  if (!userDetails?.role) return <Navigate to="/" />;

  const currentRole = userDetails.role;
  if (currentRole !== "statesubmitter" && currentRole !== "statesystemadmin")
    return <Navigate to="/profile" />;
  const requestRole = currentRole === "statesubmitter" ? "statesystemadmin" : "statesubmitter";
  const isRequestRoleAdmin = currentRole === "statesubmitter";

  const onChange = (values: StateCode[]) => {
    setStateSelected(values);
  };

  const onSubmit = async () => {
    try {
      for (const state of stateSelected) {
        await submitRequest({
          email: userDetails.email,
          state,
          role: requestRole,
          eventType: "user-role",
          requestRoleChange: true,
        });
      }
      navigate("/dashboard");
      banner({
        header: "Submission Completed",
        body: "Your submission has been received.",
        variant: "success",
        pathnameToDisplayOn: "/dashboard",
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
        <h1 className="text-xl font-medium">Registration: State Access</h1>
      </SubNavHeader>
      <ConfirmationDialog
        open={showModal}
        title="Cancel role request?"
        body="Changes you made will not be saved."
        onAccept={() => navigate("/signup")}
        onCancel={() => setShowModal(false)}
        cancelButtonText="Stay on Page"
        acceptButtonText="Confirm"
      />
      <SimplePageContainer>
        <div className="flex justify-center p-5">
          <div className="w-1/3">
            <div className="py-2">
              <h2 className="text-xl font-bold mb-2">User Role:</h2>
              <p className="text-xl italic">{userRoleMap[requestRole] ?? "Not Found"}</p>
            </div>
            <div className="py-2">
              <h2 className="text-xl font-bold mb-2">Select your State Access</h2>
              {isRequestRoleAdmin ? (
                <Select onValueChange={(value: StateCode) => onChange([value])}>
                  <SelectTrigger aria-label="Select state">
                    <SelectValue placeholder="Select state here" />
                  </SelectTrigger>
                  <SelectContent>
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
                />
              )}
              {!stateSelected.length && (
                <p className="text-red-600 mt-3">
                  {isRequestRoleAdmin
                    ? "Please select at least one state."
                    : "Please select a state."}
                </p>
              )}
              <div className="py-4">
                <Button className="mr-3" disabled={!stateSelected.length} onClick={onSubmit}>
                  Submit
                </Button>
                {isLoading && <LoadingSpinner />}
                <Button variant="outline" onClick={() => setShowModal(true)}>
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
