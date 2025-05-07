import { useState } from "react";
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

export const CMSSignup = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [group, setGroup] = useState<groupDivisionType | null>(null);
  const [division, setDivision] = useState<divisionsType | null>(null);
  const { mutateAsync: submitRequest } = useSubmitRoleRequests();

  const navigate = useNavigate();

  const groupSortFn = (groupA, groupB) => {
    if (groupA.abbr) {
      if (groupB.abbr) return groupA.abbr.localeCompare(groupB.abbr);
      return -1;
    }
    if (groupA.abbr) return 1;
    return 0;
  };

  const { data: userDetails } = useGetUserDetails();
  if (!userDetails) return <LoadingSpinner />;

  if (!userDetails?.role) return <Navigate to="/" />;

  const currentRole = userDetails.role;
  // TODO: refactor to use isCmsUser
  if (!["defaultcmsuser", "cmsroleapprover", "cmsreviewer"].includes(currentRole))
    return <Navigate to="/profile" />;

  const onSubmit = async () => {
    try {
      await submitRequest({
        email: userDetails.email,
        state: "N/A",
        role: currentRole === "cmsroleapprover" ? "cmsreviewer" : "cmsroleapprover",
        eventType: "user-role",
        requestRoleChange: true,
        group: group.abbr,
        division: division.abbr,
      });
      // TODO: Change?
      navigate("/");

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

  return (
    <div>
      <SubNavHeader>
        <h1 className="text-xl font-medium">
          {currentRole === "cmsroleapprover"
            ? "Registration: CMS Reviewer Access"
            : "Registration: CMS Role Approver Access"}
        </h1>
      </SubNavHeader>
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
    </div>
  );
};
