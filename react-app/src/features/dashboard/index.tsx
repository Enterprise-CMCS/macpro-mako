import { QueryClient } from "@tanstack/react-query";
import { Plus as PlusIcon } from "lucide-react";
import { Link, Navigate, redirect } from "react-router";
import { UserRoles } from "shared-types";
import { isStateUser } from "shared-utils";

import { getUser, useGetUser } from "@/api";
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

import { SpasList } from "./Lists/spas";
import { WaiversList } from "./Lists/waivers";

const loader = (queryClient: QueryClient) => {
  return async () => {
    if (!queryClient.getQueryData(["user"])) {
      await queryClient.fetchQuery({
        queryKey: ["user"],
        queryFn: () => getUser(),
      });
    }

    const isUser = queryClient.getQueryData(["user"]) as Awaited<ReturnType<typeof getUser>>;
    if (!isUser.user) {
      return redirect("/login");
    }

    return isUser;
  };
};

export const dashboardLoader = loader;

export const Dashboard = () => {
  const { data: userObj, isLoading } = useGetUser();
  const osData = useOsData();

  const [localStorageCol, setLocalStorageCol] = useLocalStorage("osDashboardData", {
    spas: { ...osData.state, tab: "spas" as OsTab },
    waivers: { ...osData.state, tab: "waivers" as OsTab },
  });

  const isAbleToAccessDashboard = () => {
    return (
      (userObj.user["custom:cms-roles"] || userObj.user["custom:ismemberof"]) &&
      Object.values(UserRoles).some(
        (role) =>
          userObj.user["custom:cms-roles"].includes(role) ||
          userObj.user["custom:ismemberof"] === role,
      )
    );
  };

  if (isLoading || osData.tabLoading) {
    return <LoadingSpinner />;
  }

  if (!userObj?.user || !isAbleToAccessDashboard()) {
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
            {isStateUser(userObj.user) && (
              <Link
                to="/new-submission"
                className="flex items-center text-white font-bold bg-primary border-none px-10 py-2 rounded cursor-pointer"
              >
                <span data-testId="new-sub-button" className="mr-2">
                  New Submission
                </span>
                <PlusIcon className="w-4 h-4" />
              </Link>
            )}
          </div>
          <div className="w-full">
            <div className="flex flex-col">
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
                <div className="flex max-w-screen-xl mx-auto px-4 lg:px-8">
                  <TabsList>
                    <TabsTrigger value="spas" className="px-6 py-2">
                      <h2 className="font-bold text-[1.3em]">SPAs</h2>
                    </TabsTrigger>
                    <TabsTrigger value="waivers" className="px-6 py-2">
                      <h2 className="font-bold text-[1.3em]">Waivers</h2>
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="spas">
                  <SpasList />
                </TabsContent>
                <TabsContent value="waivers">
                  <WaiversList />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </FilterDrawerProvider>
      </div>
    </OsProvider>
  );
};
