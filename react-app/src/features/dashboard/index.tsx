import { QueryClient } from "@tanstack/react-query";
import { Plus as PlusIcon } from "lucide-react";
import { getUser, useGetUser } from "@/api";
import { WaiversList } from "./Lists/waivers";
import { SpasList } from "./Lists/spas";
import {
  OsProvider,
  type OsTab,
  useOsData,
  FilterDrawerProvider,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components";
import { isStateUser } from "shared-utils";
import { Link, Navigate, redirect } from "react-router-dom";

const loader = (queryClient: QueryClient) => {
  return async () => {
    if (!queryClient.getQueryData(["user"])) {
      await queryClient.fetchQuery({
        queryKey: ["user"],
        queryFn: () => getUser(),
      });
    }

    const isUser = queryClient.getQueryData(["user"]) as Awaited<
      ReturnType<typeof getUser>
    >;
    if (!isUser.user) {
      return redirect("/");
    }

    return isUser;
  };
};

export const dashboardLoader = loader;

export const Dashboard = () => {
  const { data: userObj } = useGetUser();
  const osData = useOsData();

  if (userObj === undefined) {
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
                <span className="mr-2">New Submission</span>
                <PlusIcon className="w-4 h-4" />
              </Link>
            )}
          </div>
          <div className="w-full">
            <div className="flex flex-col">
              <Tabs
                value={osData.state.tab}
                onValueChange={(tab) =>
                  osData.onSet(
                    (s) => ({
                      ...s,
                      filters: [],
                      tab: tab as OsTab,
                      search: "",
                    }),
                    true,
                  )
                }
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
