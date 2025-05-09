import { UserRole } from "shared-types/events/legacy-user";

import { CardWithTopBorder } from "@/components/Cards";

type GroupAndDivisionProps = {
  division: string;
  group: string;
  role: UserRole;
};

export const GroupAndDivision = ({ division, group, role }: GroupAndDivisionProps) => {
  if (role === "defaultcmsuser" || role === "systemadmin") {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">Group & Division</h2>
      <CardWithTopBorder className="my-0">
        <div className="p-8 flex gap-x-1 items-center">
          <h3 className="text-xl font-bold">Group:</h3>
          <p>{group}</p>
        </div>

        <div className="p-8 flex gap-x-1 items-center">
          <h3 className="text-xl font-bold">Division:</h3>
          <p>{division}</p>
        </div>
      </CardWithTopBorder>
    </div>
  );
};
