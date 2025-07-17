import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import { useGetUserDetails, useSubmitRoleRequests } from "@/api";
import { banner, Button, LoadingSpinner, SimplePageContainer, SubNavHeader } from "@/components";

export const CMSConfirmation = () => {
  const navigate = useNavigate();
  const { data: userDetails, isLoading } = useGetUserDetails();
  const { mutateAsync: submitRequest } = useSubmitRoleRequests();
  const queryClient = useQueryClient();

  if (isLoading) return <LoadingSpinner />;

  const onSubmit = async () => {
    try {
      await submitRequest({
        email: userDetails.email,
        state: "N/A",
        role: "cmsroleapprover",
        eventType: "user-role",
        requestRoleChange: true,
      });

      // Invalidate cached user details so the profile page shows the updated role
      await queryClient.invalidateQueries({ queryKey: ["getUserDetails"] });

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
          <div className="w-1/2 text-center">
            <p className="text-lg font-semibold mb-4">You are requesting the following role:</p>
            <p className="italic mb-6">CMS Role Approver</p>
            <div className="flex justify-center space-x-4">
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
