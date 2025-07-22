import { useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { UserRole } from "shared-types/events/legacy-user";

import { useGetUserDetails, useSubmitRoleRequests } from "@/api";
import { banner, Button, LoadingSpinner, SimplePageContainer, SubNavHeader } from "@/components";

import { roleOptions } from "./sign-up";

export const CMSConfirmation = () => {
  const navigate = useNavigate();
  const { data: userDetails, isLoading } = useGetUserDetails();
  const { mutateAsync: submitRequest } = useSubmitRoleRequests();
  const queryClient = useQueryClient();

  const [searchParams] = useSearchParams();
  const roleKey = searchParams.get("role") as UserRole;

  if (isLoading) return <LoadingSpinner />;

  if (!userDetails?.role || roleKey === null) return <Navigate to="/" />;

  // Find the role option matching the query param
  const matchedRoleOption = roleOptions.find((opt) => opt.key === roleKey);

  // Convert roles to strings to avoid  TS 'never' type issues
  const isAllowedToRequestRole = (matchedRoleOption?.rolesWhoCanView.map(String) ?? []).includes(
    String(userDetails.role),
  );

  if (!isAllowedToRequestRole) {
    return <Navigate to="/profile" />;
  }

  const onSubmit = async () => {
    try {
      await submitRequest({
        email: userDetails.email,
        state: "N/A",
        role: matchedRoleOption.key,
        eventType: "user-role",
        requestRoleChange: true,
      });

      // refetch profile into cache to ensure we show new role request on profile page
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await queryClient.refetchQueries({ queryKey: ["profile"] });

      const redirectPath = "/profile";
      banner({
        header: "Submission Completed",
        body: "Your submission has been received.",
        variant: "success",
        pathnameToDisplayOn: redirectPath,
      });
      navigate(redirectPath);
    } catch (error) {
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
        <h1 className="text-xl font-medium">Confirm Role Request</h1>
      </SubNavHeader>
      <SimplePageContainer>
        <div className="flex justify-center p-5">
          <div className="w-1/2">
            <p className="text-lg font-semibold mb-4">You are requesting the following role:</p>
            <p className="italic mb-6">{matchedRoleOption.title}</p>
            <div className="flex space-x-4">
              <Button onClick={onSubmit}>Submit</Button>
              <Button variant="outline" onClick={() => navigate("/profile")}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </SimplePageContainer>
    </div>
  );
};
