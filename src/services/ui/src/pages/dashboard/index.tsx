import * as UI from "@enterprise-cmcs/macpro-ux-lib";
import { redirect } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import { getUser } from "@/api/useGetUser";
import { WaiversList } from "./Lists/waivers";
import { SpasList } from "./Lists/spas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/Tabs";
import { OsProvider, type OsTab, useOsQuery } from "@/components/Opensearch";

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
  const query = useOsQuery();

  return (
    <OsProvider
      value={{
        data: query.data,
        error: query.error,
        isLoading: query.isLoading,
      }}
    >
      <div className="max-w-screen-xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between my-4">
          <UI.Typography size="lg" as="h1">
            Dashboard
          </UI.Typography>
        </div>
        <div className="w-[100%] items-center justify-center">
          <Tabs
            value={query.state.tab}
            onValueChange={(tab) =>
              query.onSet(
                (s) => ({ ...s, tab: tab as OsTab, search: "" }),
                true
              )
            }
          >
            <TabsList>
              <TabsTrigger value="spas" className="px-6 py-2">
                <UI.Typography
                  size="md"
                  className="font-bold text-[1.3em]"
                  as="h1"
                >
                  SPAs
                </UI.Typography>
              </TabsTrigger>
              <TabsTrigger value="waivers" className="px-6 py-2">
                <UI.Typography
                  size="md"
                  className="font-bold text-[1.3em]"
                  as="h1"
                >
                  Waivers
                </UI.Typography>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="spas">
              <SpasList />
            </TabsContent>
            <TabsContent value="waivers">
              <WaiversList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </OsProvider>
  );
};
