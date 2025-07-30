import { ChevronLeft } from "lucide-react";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { StateCode } from "shared-types";
import { UserRole } from "shared-types/events/legacy-user";
import { userRoleMap } from "shared-utils";

import { Button, SimplePageContainer, SubNavHeader } from "@/components";
import { convertStateAbbrToFullName } from "@/utils";

export const StateConfirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const roleToRequest = searchParams.get("role") as UserRole;
  const statesParam = searchParams.get("states");

  const statesToRequest: StateCode[] = statesParam ? (statesParam.split(",") as StateCode[]) : [];

  const roleSelectionPath = `/signup/state/role?states=${statesParam}`;

  if (!roleToRequest) return <Navigate to={roleSelectionPath} />;

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
                {statesToRequest.length > 1 ? "States:" : "State:"}
              </h2>
              <p className="text-xl italic">
                {statesToRequest.map((state) => convertStateAbbrToFullName(state)).join(", ")}
              </p>
            </div>
            <div className="py-3">
              <h2 className="text-xl font-bold mb-2">User Role:</h2>
              <p className="text-xl italic">{userRoleMap[roleToRequest]}</p>

              <div className="py-4">
                <Button className="mr-3">Submit</Button>
                <Button variant="link" onClick={() => navigate(roleSelectionPath)}>
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
