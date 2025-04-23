import { FULL_CENSUS_STATES } from "shared-types";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SimplePageContainer,
  SubNavHeader,
} from "@/components";
import { Option } from "@/components/Opensearch/main/Filtering/Drawer/Filterable";

export const StateSignup = () => {
  const stateOptions: Option[] = FULL_CENSUS_STATES.map(({ label, value }) => ({ label, value }));

  return (
    <div>
      <SubNavHeader>
        <h1 className="text-xl font-medium">Registration: State Access</h1>
      </SubNavHeader>
      <SimplePageContainer>
        <h2 className="text-xl font-bold">User Role:</h2>
        <p className="text-xl italic">State System Admin</p>

        <h2 className="text-xl font-bold">Select your State Access</h2>
        <Select
          onValueChange={(value) => {
            console.log("value", value);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select state here" />
          </SelectTrigger>
          <SelectContent>
            {stateOptions.map((state) => (
              <SelectItem value={state.value} key={state.value}>
                {state.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SimplePageContainer>
    </div>
  );
};
