import { useMemo } from "react";
import { QueryClient } from "@tanstack/react-query";
import { getUser } from "@/api";
import { WaiversList } from "./Lists/waivers";
import { SpasList } from "./Lists/spas";
import {
  OsProvider,
  type OsTab,
  useOsData,
  FilterChips,
  FilterDrawerProvider,
  useUserContext,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Link,
  Navigate,
  redirect,
} from "@/components";

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
      return redirect({ path: "/" });
    }

    return isUser;
  };
};

export const dashboardLoader = loader;

export const Dashboard = () => {
  const userContext = useUserContext();
  const osData = useOsData();

  const role = useMemo(() => {
    return userContext?.user?.["custom:cms-roles"] ? true : false;
  }, []);

  if (!role) {
    return <Navigate path={"/"} />;
  }

  return (
    <OsProvider
      value={{
        data: osData.data,
        error: osData.error,
        isLoading: osData.isLoading,
      }}
    >
      <FilterDrawerProvider>
        <div className="max-w-screen-xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between my-4">
            <h1 className="text-xl">Dashboard</h1>
            {!userContext?.isCms && (
              <Link
                path="/new-submission"
                className="text-white bg-primary inline-block border-none px-10 py-2 rounded cursor-pointer"
              >
                New Submission
              </Link>
            )}
          </div>
          <div className="w-[100%] items-center justify-center">
            <Tabs
              value={osData.state.tab}
              onValueChange={(tab) =>
                osData.onSet(
                  (s) => ({ ...s, filters: [], tab: tab as OsTab, search: "" }),
                  true
                )
              }
            >
              <TabsList>
                <TabsTrigger value="spas" className="px-6 py-2">
                  <h2 className="font-bold text-[1.3em]">SPAs</h2>
                </TabsTrigger>
                <TabsTrigger value="waivers" className="px-6 py-2">
                  <h2 className="font-bold text-[1.3em]">Waivers</h2>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="spas">
                <FilterChips />
                <SpasList />
              </TabsContent>
              <TabsContent value="waivers">
                <FilterChips />
                <WaiversList />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </FilterDrawerProvider>
    </OsProvider>
  );
};
