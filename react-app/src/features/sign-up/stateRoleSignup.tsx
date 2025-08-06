import { ChevronLeft } from "lucide-react";
import { useMemo } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { StateCode, UserDetails } from "shared-types";
import { UserRole } from "shared-types/events/legacy-user";
import { isStateRole } from "shared-utils";

import { useGetUserDetails, useGetUserProfile, useStateAccessMap } from "@/api";
import {
  LoadingSpinner,
  OptionCard,
  OptionFieldset,
  SimplePageContainer,
  SubNavHeader,
} from "@/components";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { convertStateAbbrToFullName } from "@/utils";

type RoleOptions = {
  key: UserRole;
  title: string;
  description: string;
  link: string;
};

export const StateRoleSignup = () => {
  const isNewUserRoleDisplay = useFeatureFlag("SHOW_USER_ROLE_UPDATE");
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const statesParam = searchParams.get("states") as StateCode;

  const statesRequested = useMemo(() => statesParam?.split(",") ?? [], [statesParam]);

  const { data, isLoading: isUserDetailsLoading } = useGetUserDetails();
  const userDetails = data as UserDetails | null;
  const { data: userProfile } = useGetUserProfile();

  const stateAccessMap = useStateAccessMap(userProfile?.stateAccess);

  const encodedStatesQuery = encodeURIComponent(statesParam ?? "");

  const roleOptions = [
    {
      key: "statesubmitter",
      title: "State Submitter",
      description: "Responsible for submitting packages",
      link: `/signup/state/role/confirm?role=statesubmitter&states=${encodedStatesQuery}`,
    },
    {
      key: "statesystemadmin",
      title: "State System Administrator",
      description: "Ability to approve state submitters and submit packages",
      link: `/signup/state/role/confirm?role=statesystemadmin&states=${encodedStatesQuery}`,
    },
  ] satisfies RoleOptions[];

  // Filter out role(s) if it already exists for every selected state
  const filteredRoleOptions = useMemo(() => {
    return roleOptions.filter((roleOption) => {
      const hasRoleInAllStates = statesRequested.every((state) => {
        const rolesForState = stateAccessMap[state];
        return rolesForState?.has(roleOption.key as UserRole);
      });
      return !hasRoleInAllStates;
    });
  }, [roleOptions, statesRequested, stateAccessMap]);

  if (!isNewUserRoleDisplay) return <Navigate to="/signup" replace />;
  if (!statesParam) return <Navigate to="/signup/state" />;
  if (isUserDetailsLoading) return <LoadingSpinner />;
  if (!userDetails) return <Navigate to="/" />;
  if (userDetails.role && !isStateRole(userDetails.role)) {
    return <Navigate to="/profile" />;
  }

  return (
    <div>
      <SubNavHeader>
        <div className="flex items-center">
          <ChevronLeft
            className="text-sky-700 w-6 h-6 mr-2 cursor-pointer"
            onClick={() => navigate("/signup/state")}
          />
          <h1 className="text-xl font-medium">Select A Role</h1>
        </div>
      </SubNavHeader>
      <SimplePageContainer>
        <section className="max-w-3xl mx-auto">
          <div className="py-10">
            <h2 className="text-xl font-bold">
              {statesRequested.length > 1 ? "States:" : "State:"}
            </h2>
            <p className="text-xl italic">
              {statesRequested.map((state) => convertStateAbbrToFullName(state)).join(", ")}
            </p>
          </div>
          <div className="pb-10">
            <h2 className="text-xl font-bold">Available roles to add</h2>
            <OptionFieldset>
              {filteredRoleOptions.map((role) => (
                <OptionCard
                  description={role.description}
                  title={role.title}
                  to={role.link}
                  key={role.key}
                />
              ))}
            </OptionFieldset>
          </div>
        </section>
      </SimplePageContainer>
    </div>
  );
};
