import { ChevronLeft } from "lucide-react";
import { FormEvent } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router";
import { StateCode } from "shared-types";
import { UserRole } from "shared-types/events/legacy-user";
import { userRoleMap } from "shared-utils";

import { useGetUserDetails, useSubmitRoleRequests } from "@/api";
import {
  banner,
  Button,
  LoadingSpinner,
  SimplePageContainer,
  SubNavHeader,
  userPrompt,
} from "@/components";
import { convertStateAbbrToFullName } from "@/utils";

export const StateConfirmation = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  const { mutateAsync: submitUserRequest, isLoading: isSubmitUserRequestLoading } =
    useSubmitRoleRequests();
  const { data: userDetails, isLoading: isUserLoading } = useGetUserDetails();

  const roleToRequest = searchParams.get("role") as UserRole;
  const statesParam = searchParams.get("states");

  const statesToRequest: StateCode[] = statesParam ? (statesParam.split(",") as StateCode[]) : [];

  const roleSelectionPath = `/signup/state/role?states=${statesParam}`;

  if (isUserLoading) {
    return <LoadingSpinner />;
  }

  if (!userDetails) {
    return <Navigate to="/" />;
  }

  if (!roleToRequest) return <Navigate to={roleSelectionPath} />;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const roleRequests = statesToRequest.map((state) =>
      submitUserRequest({
        email: userDetails.email,
        role: roleToRequest,
        state,
        eventType: "user-role",
        requestRoleChange: true,
      }),
    );

    const results = await Promise.allSettled(roleRequests);
    const failedRequests = results.filter((result) => result.status === "rejected");

    if (failedRequests.length > 0) {
      return banner({
        variant: "destructive",
        header: "Error submitting role requests",
        body: "Some role requests could not be submitted. Please try again.",
        pathnameToDisplayOn: pathname,
      });
    }

    banner({
      variant: "success",
      header: "Submission Completed",
      body: "Your submission has been received.",
      pathnameToDisplayOn: "/profile",
    });

    return navigate("/profile");
  };

  const onCancel = () => {
    userPrompt({
      header: "Cancel role request?",
      body: "Changes you made will not be saved.",
      onAccept: () => navigate(roleSelectionPath),
      onCancel: () => {},
      acceptButtonText: "Confirm",
      cancelButtonText: "Stay on Page",
    });
  };

  return (
    <div>
      <SubNavHeader>
        <div className="flex items-center">
          <ChevronLeft
            className="text-sky-700 w-6 h-6 mr-2 cursor-pointer"
            onClick={() => navigate("/signup/state")}
          />
          <h1 className="text-xl font-medium">Submit Role Request</h1>
        </div>
      </SubNavHeader>
      <SimplePageContainer>
        <div className="flex justify-center p-5 my-10 pb-10">
          <div className="w-1/3">
            <div className="py-3">
              <h2 className="text-xl font-bold mb-2">
                {statesToRequest.length > 1 ? "States / Territories:" : "State / Territory:"}
              </h2>
              <p className="text-xl italic">
                {statesToRequest.map((state) => convertStateAbbrToFullName(state)).join(", ")}
              </p>
            </div>
            <div className="py-3">
              <h2 className="text-xl font-bold mb-2">User Role:</h2>
              <p className="text-xl italic">{userRoleMap[roleToRequest]}</p>

              <div className="py-4">
                <Button
                  className="mr-3"
                  type="submit"
                  aria-label="Submit role request"
                  onClick={onSubmit}
                  disabled={isSubmitUserRequestLoading}
                  loading={isSubmitUserRequestLoading}
                >
                  Submit
                </Button>
                <Button
                  variant="link"
                  onClick={onCancel}
                  type="button"
                  aria-label="Cancel role request"
                  disabled={isSubmitUserRequestLoading}
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
