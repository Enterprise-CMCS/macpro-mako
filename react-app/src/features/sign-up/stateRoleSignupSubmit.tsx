import { ChevronLeft } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { StateCode } from "shared-types";
import { UserRole } from "shared-types/events/legacy-user";
import { userRoleMap } from "shared-utils";

import { Button, SimplePageContainer, SubNavHeader } from "@/components";
import { convertStateAbbrToFullName } from "@/utils";

export const StateRoleSignupSubmit = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const roleToRequest = searchParams.get("role") as UserRole;
  const statesParam = searchParams.get("states");

  const statesToRequest: StateCode[] = statesParam ? (statesParam.split(",") as StateCode[]) : [];

  const roleSelectionPath = `/signup/state/role?states=${statesParam}`;

  useEffect(() => {
    if (!roleToRequest) {
      navigate(roleSelectionPath);
    }
  }, [roleToRequest, statesParam, navigate, roleSelectionPath]);

  if (!roleToRequest) return null;

  return (
    <div>
      <SubNavHeader>
        {/* Fix styling */}
        <ChevronLeft
          className="text-sky-700 w-7 h-7 items-center cursor-pointer"
          onClick={() => navigate(roleSelectionPath)}
        />
        <h1 className="text-xl font-medium">Submit Role Request</h1>
      </SubNavHeader>
      {/* Fix styling */}
      <SimplePageContainer>
        <div className="flex justify-center p-5">
          <div className="w-1/3">
            <div className="py-2">
              <h2 className="text-xl font-bold mb-2">
                {statesToRequest.length ? "States:" : "State:"}
              </h2>
              <p className="text-xl italic">
                {statesToRequest.map((state) => convertStateAbbrToFullName(state)).join(", ")}
              </p>
              <h2 className="text-xl font-bold mb-2">User Role:</h2>
              <p className="text-xl italic">{userRoleMap[roleToRequest]}</p>
              <Button className="mr-3">Submit</Button>
              <Button variant="link">Cancel</Button>
            </div>
          </div>
        </div>
      </SimplePageContainer>
    </div>
  );
};
