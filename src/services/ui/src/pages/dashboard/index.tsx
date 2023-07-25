import * as UI from "@enterprise-cmcs/macpro-ux-lib";
import { ChangeEvent, ChangeEventHandler, useState } from "react";
import { redirect } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import { getUser, useGetUser } from "@/api/useGetUser";
import { WaiversList } from "./Lists/waivers";
import { SpasList } from "./Lists/spas";
import { getUserStateCodes } from "@/utils/user";

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

const StateSelector = ({
  selectedState,
  handleStateChange,
  userStateCodes,
}: {
  selectedState: string;
  handleStateChange: ChangeEventHandler<HTMLSelectElement>;
  userStateCodes: string[];
}) => {
  if (userStateCodes.length === 1) {
    return <h3>Region: {userStateCodes[0]}</h3>;
  }

  return (
    <div>
      <label htmlFor="state-select">Select a state: </label>
      <select
        id="state-select"
        value={selectedState}
        onChange={handleStateChange}
      >
        {userStateCodes.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>
    </div>
  );
};

export const Dashboard = () => {
  const { data } = useGetUser();
  const userStateCodes = getUserStateCodes(data?.user);

  const [selectedState, setSelectedState] = useState(userStateCodes[0]);

  const handleStateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(event.target.value);
  };

  return (
    <div className="max-w-screen-lg mx-auto px-4 lg:px-8">
      <div className="flex items-center justify-between my-4">
        <UI.Typography size="lg" as="h1">
          Dashboard
        </UI.Typography>
        <StateSelector
          userStateCodes={userStateCodes}
          handleStateChange={handleStateChange}
          selectedState={selectedState}
        />
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
