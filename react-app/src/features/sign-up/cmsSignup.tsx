import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router";

import {
  useGetUserDetails,
  // useSubmitGroupDivision,
  useSubmitRoleRequests,
} from "@/api";
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

import { divisionsType, groupDivision, groupDivisionType } from "./groupDivision";

// sorting helper function
const groupSortFn = (groupA, groupB) => {
  if (groupA.abbr) {
    if (groupB.abbr) return groupA.abbr.localeCompare(groupB.abbr);
    return -1;
  }
  if (groupA.abbr) return 1;
  return 0;
};

export const CMSSignup = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [group, setGroup] = useState<groupDivisionType | null>(null);
  const [division, setDivision] = useState<divisionsType | null>(null);
  const { mutateAsync: submitRequest } = useSubmitRoleRequests();

  const navigate = useNavigate();

  const { data: userDetails } = useGetUserDetails();
  const currentRole = userDetails?.role;

  const onSubmit = async () => {
    try {
      await submitRequest({
        email: userDetails.email,
        state: "N/A",
        role: isCMSRoleApprover ? "defaultcmsuser" : "cmsroleapprover",
        eventType: "user-role",
        requestRoleChange: true,
        group: !isCMSRoleApprover ? group.abbr : null,
        division: !isCMSRoleApprover ? division.abbr : null,
      });

      if (isCMSRoleApprover) navigate("/usermanagement");
      else navigate("/");

      banner({
        header: "Submission Completed",
        body: "Your submission has been received.",
        variant: "success",
        pathnameToDisplayOn: "/",
      });
    } catch (error) {
      console.error(`Error updating group and division: ${error?.message || error}`);

      banner({
        header: "An unexpected error has occurred:",
        body: error instanceof Error ? error.message : String(error),
        variant: "destructive",
        pathnameToDisplayOn: window.location.pathname,
      });
    }
  };

  // should leave this page if the user is requesting to be read-on
  // this work could be done in sign-up but we want to keep the submit fnc in one place & have a loading screen
  useEffect(() => {
    const autoSubmit = async () => {
      if (currentRole === "cmsroleapprover") {
        try {
          await onSubmit();
        } catch (e) {
          console.error("CMS Read-only access submission failed", e);
        }
      }
    };
    autoSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!userDetails) return <LoadingSpinner />;

  if (!userDetails?.role) return <Navigate to="/" />;

  const isCMSRoleApprover = currentRole === "cmsroleapprover";

  // TODO: refactor to use isCmsUser
  if (!["defaultcmsuser", "cmsroleapprover", "cmsreviewer"].includes(currentRole))
    return <Navigate to="/profile" />;

  return (
    <div>
      <SubNavHeader>
        <h1 className="text-xl font-medium">
          {isCMSRoleApprover
            ? "Registration: CMS Read-only Access"
            : "Registration: CMS Role Approver Access"}
        </h1>
      </SubNavHeader>
      {!isCMSRoleApprover && (
        <SimplePageContainer>
          <ConfirmationDialog
            open={showModal}
            title="Cancel role request?"
            body="Changes you made will not be saved."
            onAccept={() => navigate("/signup")}
            onCancel={() => setShowModal(false)}
            cancelButtonText="Stay on Page"
            acceptButtonText="Confirm"
          />

          <div className="flex justify-center p-5">
            <div className="w-1/2">
              <div className="py-2">
                <h2 className="text-xl font-bold mb-2">Select a Group and Division</h2>
              </div>

              <div className="py-4">
                <h2 className="text-xl font-bold mb-2">Group</h2>
                <Select
                  onValueChange={(value) => {
                    const matchingGroup: groupDivisionType[] = groupDivision.filter(
                      (group) => group.abbr === value,
                    );
                    setGroup(matchingGroup[0]);
                  }}
                >
                  <SelectTrigger aria-label="Select group">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {groupDivision.sort(groupSortFn).map((group) => (
                      <SelectItem value={group.abbr} key={`${group.id}-${group.abbr}`}>
                        <span className="font-bold min-w-[4rem]">{group.abbr}</span>
                        <span>{group.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {group && (
                <div className="py-4">
                  <h2 className="text-xl font-bold mb-2">Division</h2>
                  <Select
                    onValueChange={(value) => {
                      const matchingDivision: divisionsType[] = group.divisions.filter(
                        (division) => division.id === parseInt(value),
                      );
                      setDivision(matchingDivision[0]);
                    }}
                  >
                    <SelectTrigger aria-label="Select division">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {group &&
                        group.divisions.sort(groupSortFn).map((divisions) => (
                          <SelectItem
                            value={divisions.id.toString()}
                            key={`${divisions.id}-${divisions.abbr}`}
                          >
                            <span className="font-bold min-w-[4rem]">{divisions.abbr ?? "--"}</span>
                            <span>{divisions.name}</span>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="py-4">
                <Button className="mr-3" disabled={division == null} onClick={onSubmit}>
                  Submit
                </Button>
                <Button variant="outline" onClick={() => setShowModal(true)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </SimplePageContainer>
      )}
    </div>
  );
};
