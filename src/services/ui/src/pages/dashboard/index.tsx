import * as UI from "@enterprise-cmcs/macpro-ux-lib";
import { ChangeEvent, useState } from "react";
import { redirect } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import { getUser } from "@/api/useGetUser";
import { WaiversList } from "./Lists/waivers";
import { SpasList } from "./Lists/spas";

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
  const [selectedState, setSelectedState] = useState("VA");

  const handleStateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(event.target.value);
  };

  return (
    <div className="max-w-screen-lg mx-auto px-4 lg:px-8">
      <div className="flex items-center justify-between my-4">
        <UI.Typography size="lg" as="h1">
          Dashboard
        </UI.Typography>

        <div>
          <label htmlFor="state-select">Select a state: </label>
          <select
            id="state-select"
            value={selectedState}
            onChange={handleStateChange}
          >
            <option value="VA">VA</option>
            <option value="OH">OH</option>
            <option value="SC">SC</option>
          </select>
        </div>
      </div>
      <div
        style={{
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <UI.Tabs>
          <UI.TabPanel id="tab-panel--spas" tabLabel="SPAs">
            <SpasList selectedState={selectedState} />
          </UI.TabPanel>
          <UI.TabPanel id="tab-panel--waivers" tabLabel="Waivers">
            <WaiversList selectedState={selectedState} />
          </UI.TabPanel>
        </UI.Tabs>
      </div>
    </div>
  );
};
