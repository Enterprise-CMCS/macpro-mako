import { useState } from "react";
import { Navigate, useNavigate } from "react-router";

import { useGetUserDetails } from "@/api";
import {
  Button,
  ConfirmationDialog,
  LoadingSpinner,
  SimplePageContainer,
  SubNavHeader,
} from "@/components";

export const CMSSignup = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const navigate = useNavigate();

  const { data: userDetails } = useGetUserDetails();
  if (!userDetails) return <LoadingSpinner />;

  const currentRole = userDetails.role;
  if (currentRole !== "statesubmitter" && currentRole !== "statesystemadmin")
    return <Navigate to="/profile" />;

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
          <div className="w-1/3">
            <div className="py-2">
              <h2 className="text-xl font-bold mb-2">Select a Group and Division</h2>
              <p className="text-xl italic">Group</p>
            </div>

            {/* TODO: mimic onemac Group logic */}
            {/* <div className="py-2">
              <h2 className="text-xl font-bold mb-2">Select your State Access</h2>
              <Select
                onValueChange={(value) => {
                  console.log("value", value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state here" />
                </SelectTrigger>
                <SelectContent>
                  {stateOptions.map((state) => (
                    <SelectItem value={state.value} key={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}

            <div className="py-4">
              <Button className="mr-3" onClick={() => console.log("submit")}>
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
