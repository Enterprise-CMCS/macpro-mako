import { useState } from "react";
import { Navigate, useNavigate } from "react-router";

import { useGetUserDetails, useSubmitGroupDivision } from "@/api";
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
  const { mutateAsync } = useSubmitGroupDivision();

  const navigate = useNavigate();

  const { data: userDetails } = useGetUserDetails();
  if (!userDetails) return <LoadingSpinner />;

  const currentRole = userDetails.role;
  if (currentRole !== "defaultcmsuser" && currentRole !== "cmsroleapprover")
    return <Navigate to="/profile" />;

  const onSubmit = async () => {
    try {
      await mutateAsync({ group: group.name, division: division.name });

      banner({
        header: "Submission Completed",
        body: "Your submission has been received.",
        variant: "success",
        pathnameToDisplayOn: window.location.pathname,
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
        <h1 className="text-xl font-medium">Registration: CMS Reviewer Access</h1>
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

            {/* TODO: mimic onemac Group logic */}
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
                <SelectTrigger>
                  <SelectValue placeholder="Select state here" />
                </SelectTrigger>
                <SelectContent>
                  {groupDivision.map((group) => (
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
                    console.log(matchingDivision);
                    setDivision(matchingDivision[0]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state here" />
                  </SelectTrigger>
                  <SelectContent>
                    {group &&
                      group.divisions.map((divisions) => (
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
