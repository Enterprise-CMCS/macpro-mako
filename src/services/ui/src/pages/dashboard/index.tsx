import { Link, Navigate, redirect } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import { getUser } from "@/api/useGetUser";
import { WaiversList } from "./Lists/waivers";
import { SpasList } from "./Lists/spas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/Tabs";
import {
  OsProvider,
  type OsTab,
  useOsQuery,
  FilterChips,
  FilterDrawerProvider,
} from "@/components/Opensearch";
import { ROUTES } from "@/routes";
import { useUserContext } from "@/components/Context/userContext";
import { useMemo } from "react";
import { Button } from "@/components/Inputs";

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
  const userContext = useUserContext();
  const query = useOsQuery();

  const role = useMemo(() => {
    return userContext?.user?.["custom:cms-roles"] ? true : false;
  }, []);

  if (!role) {
    return <Navigate to={ROUTES.HOME} />;
  }

  return (
    <OsProvider
      value={{
        data: query.data,
        error: query.error,
        isLoading: query.isLoading,
      }}
    >
      <FilterDrawerProvider>
        <div className="max-w-screen-xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between my-4">
            <h1 className="text-xl">Dashboard</h1>
            {!userContext?.isCms && (
              <Button>
                <Link
                  to={ROUTES.NEW_SUBMISSION_OPTIONS}
                  className="button-style"
                  style={{
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  New Submission
                </Link>
              </Button>
            )}
          </div>
          <div className="w-[100%] items-center justify-center">
            <Tabs
              value={query.state.tab}
              onValueChange={(tab) =>
                query.onSet(
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
