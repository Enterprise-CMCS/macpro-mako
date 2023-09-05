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
      <div className="tw-max-w-screen-xl tw-mx-auto tw-px-4 lg:tw-px-8">
        <div className="tw-flex tw-items-center tw-justify-between tw-my-4">
          <UI.Typography size="lg" as="h1">
            Dashboard
          </UI.Typography>
        </div>
        <div className="tw-w-[100%] tw-items-center tw-justify-center">
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
              <TabsTrigger value="spas" className="tw-px-6 tw-py-2">
                <UI.Typography
                  size="md"
                  className="tw-font-bold tw-text-[1.3em]"
                  as="h1"
                >
                  SPAs
                </UI.Typography>
              </TabsTrigger>
              <TabsTrigger value="waivers" className="tw-px-6 tw-py-2">
                <UI.Typography
                  size="md"
                  className="tw-font-bold tw-text-[1.3em]"
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
