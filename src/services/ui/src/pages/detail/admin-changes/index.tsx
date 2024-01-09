import { Accordion, DetailsSection } from "@/components";
import { opensearch } from "shared-types";
import { FC } from "react";
import { AdminChange } from "./AdminChanges";

export const ACTIONS_ADMIN = ["disable-rai-withdraw", "enable-rai-withdraw"];

export const AdminChanges: FC<opensearch.main.Document> = (props) => {
  const data = props.changelog?.filter((CL) =>
    ACTIONS_ADMIN.includes(CL._source.actionType)
  );
  return (
    <DetailsSection
      id="admin-updates"
      title={`Administrative Package Changes (${data?.length})`}
      description="Administrative changes reflect updates to specific data fields. If you have additional questions, please contact the assigned CPOC."
    >
      {!data?.length && <p className="text-gray-500">-- no logs --</p>}
      <Accordion type="multiple" className="flex flex-col mt-6 gap-2">
        {data?.map((CL) => (
          <AdminChange {...CL._source} key={CL._source.id} />
        ))}
      </Accordion>
    </DetailsSection>
  );
};
