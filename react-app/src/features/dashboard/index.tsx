import { QueryClient } from "@tanstack/react-query";
import { Plus as PlusIcon } from "lucide-react";
import { Link, Navigate, redirect } from "react-router";
import { UserRoles } from "shared-types";
import { isStateUser } from "shared-utils";

import { getUser, OneMacUser, useGetUser, useGetUserDetails } from "@/api";
import { createUserProfile } from "@/api/useCreateUserProfile";
import { requestBaseCMSAccess } from "@/api/useRequestBaseCMSAccess";
import {
  FilterDrawerProvider,
  LoadingSpinner,
  OsProvider,
  OsTab,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useOsData,
} from "@/components";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

import { SpasList } from "./Lists/spas";
import { WaiversList } from "./Lists/waivers";

const ROLE_JUST_GRANTED = "User role updated, because no default role found";
const ROLE_INDEX_WAIT_MS = 45_000;
const ROLE_INDEX_POLL_MS = 2_000;

const hasUsableRole = (user: OneMacUser | undefined) =>
  Boolean(user?.user?.role && user.user.role !== "norole");

const wasRoleJustGranted = (accessResult: unknown) =>
  typeof accessResult === "object" &&
  accessResult !== null &&
  "message" in accessResult &&
  accessResult.message === ROLE_JUST_GRANTED;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const loader = (queryClient: QueryClient, loginFlag?: boolean) => {
  return async () => {
    const accessResult = await requestBaseCMSAccess();
    await createUserProfile();

    const fetchUser = async () => {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      return queryClient.fetchQuery({
        queryKey: ["user"],
        queryFn: () => getUser(),
      });
    };

    let isUser = await fetchUser();

    if (wasRoleJustGranted(accessResult) && !hasUsableRole(isUser)) {
      const deadline = Date.now() + ROLE_INDEX_WAIT_MS;
      while (Date.now() < deadline && !hasUsableRole(isUser)) {
        await wait(ROLE_INDEX_POLL_MS);
        isUser = await fetchUser();
      }
    }

    if (!isUser.user) {
      return redirect(loginFlag ? "/" : "/login");
    }

    return isUser;
  };
};

export const dashboardLoader = loader;

export const Dashboard = () => {
  const { data: oneMacUser, isLoading: isOneMacUserLoading } = useGetUser();
  const { data: userDetails, isLoading: isUserDetailsLoading } = useGetUserDetails();
  const osData = useOsData();

  const [localStorageCol, setLocalStorageCol] = useLocalStorage("osDashboardData", {
    spas: { ...osData.state, tab: "spas" as OsTab },
    waivers: { ...osData.state, tab: "waivers" as OsTab },
  });

  const isAbleToAccessDashboard = () => {
    return (
      (oneMacUser.user["custom:cms-roles"] || oneMacUser.user["custom:ismemberof"]) &&
      Object.values(UserRoles).some((role) => oneMacUser.user.role === role)
    );
  };

  if (isOneMacUserLoading || isUserDetailsLoading || osData.tabLoading) {
    return <LoadingSpinner />;
  }

  if (!oneMacUser?.user || !isAbleToAccessDashboard()) {
    return <Navigate to="/" />;
  }

  return (
    <OsProvider
      value={{
        data: osData.data,
        error: osData.error,
        isLoading: osData.isLoading,
      }}
    >
      <div>
        <FilterDrawerProvider>
          <div className="flex flex-col w-full self-center mx-auto max-w-screen-xl xs:flex-row justify-between p-4 lg:px-8">
            <h1 className="text-xl font-bold mb-4 md:mb-0">Dashboard</h1>
            {isStateUser({
              ...oneMacUser.user,
              role: userDetails?.role ?? oneMacUser.user.role,
            }) && (
              <Link
                to="/new-submission"
                className="flex items-center text-white font-bold bg-primary border-none px-10 py-2 rounded cursor-pointer"
                onClick={() => {
                  sendGAEvent("new_submission_click", {
                    event_category: "Dashboard",
                    event_label: "from_dashboard",
                  });
                }}
              >
                <span data-testid="new-sub-button" className="mr-2">
                  New Submission
                </span>
                <PlusIcon className="w-4 h-4" />
              </Link>
            )}
          </div>

          <Tabs
            value={osData.state.tab}
            onValueChange={(tab) => {
              setLocalStorageCol((prev) => ({
                ...prev,
                [osData.state.tab]: osData.state,
              }));

              osData.onSet(
                (prev) => ({
                  ...prev,
                  ...localStorageCol[tab],
                }),
                true,
              );
            }}
          >
            <div className="max-w-screen-xl mx-auto px-4 lg:px-8">
              <TabsList>
                <TabsTrigger value="spas">SPAs</TabsTrigger>
                <TabsTrigger value="waivers">Waivers</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="spas">
              <SpasList oneMacUser={oneMacUser} />
            </TabsContent>
            <TabsContent value="waivers">
              <WaiversList oneMacUser={oneMacUser} />
            </TabsContent>
          </Tabs>
        </FilterDrawerProvider>
      </div>
    </OsProvider>
  );
};
