import { ChevronLeft } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { UserRole } from "shared-types/events/legacy-user";

import { useGetUserDetails, useGetUserProfile } from "@/api";
import {
  LoadingSpinner,
  OptionCard,
  OptionFieldset,
  SimplePageContainer,
  SubNavHeader,
} from "@/components";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { useStateAccessMap } from "@/hooks/useStateAccessMap";
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

  const statesParam = searchParams.get("states");
  const statesRequested = useMemo(() => statesParam?.split(",") ?? [], [statesParam]);

  const { data: userDetails } = useGetUserDetails();
  const { data: userProfile } = useGetUserProfile();

  const stateAccessMap = useStateAccessMap(userProfile?.stateAccess);

  useEffect(() => {
    if (!statesParam) {
      navigate("/signup/state");
    }
  }, [navigate, statesParam]);

  const encodedStatesQuery = encodeURIComponent(statesParam ?? "");

  const roleOptions = [
    {
      key: "statesubmitter",
      title: "State Submitter",
      description: "Responsible for submitting packages",
      link: `/signup/state/role/submit?role=statesubmitter&states=${encodedStatesQuery}`,
    },
    {
      key: "statesystemadmin",
      title: "State System Administrator",
      description: "Ability to approve state submitters and submit packages",
      link: `/signup/state/role/submit?role=statesystemadmin&states=${encodedStatesQuery}`,
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
  if (!userDetails) return <LoadingSpinner />;

  return (
    <div>
      <SubNavHeader>
        {/* Fix styling */}
        <ChevronLeft
          className="text-sky-700 w-7 h-7 items-center cursor-pointer"
          onClick={() => navigate("/signup/state")}
        />
        <h1 className="text-xl font-medium">Select A Role</h1>
      </SubNavHeader>
      <SimplePageContainer>
        {/* Fix styling */}
        <section className="max-w-3xl mx-auto mt-8">
          <h2 className="text-xl font-bold mb-2">
            {statesRequested.length ? "States:" : "State:"}
          </h2>
          <p className="text-xl italic">
            {statesRequested.map((state) => convertStateAbbrToFullName(state)).join(", ")}
          </p>
          {/* Fix styling */}
          <h2 className="text-xl font-bold mt-4">Available roles to add</h2>
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
        </section>
      </SimplePageContainer>
    </div>
  );
};
