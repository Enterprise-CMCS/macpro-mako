import { XIcon } from "lucide-react";

import { CardWithTopBorder } from "@/components";
import { convertStateAbbrToFullName, stateAccessStatus } from "@/utils";

export type StateAccessProps = {
  role: string;
  onClick: () => void;
  access: {
    territory: string;
    role: string;
    status: string;
    doneByName: string;
    doneByEmail: string;
  };
};

export const StateAccessCard = ({ role, onClick, access }: StateAccessProps) => (
  <CardWithTopBorder className="my-0" key={`${access.territory}-${access.role}`}>
    <button
      disabled={role !== "statesubmitter"}
      data-testid="self-revoke"
      onClick={onClick}
      title="close"
    >
      <XIcon size={20} />
    </button>

    <div className="p-8 min-h-36">
      <h3 className="text-xl font-bold">{convertStateAbbrToFullName(access.territory)}</h3>
      <p className="italic">{stateAccessStatus[access.status]}</p>
      <p className="block lg:mt-8 lg:mb-2">
        <span className="font-semibold">State System Admin: </span>
        <a className="text-blue-600" href={`mailto:${access.doneByEmail}`}>
          {access.doneByName}
        </a>
      </p>
    </div>
  </CardWithTopBorder>
);
