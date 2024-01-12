import { Accordion, DetailsSection } from "@/components";
import { opensearch } from "shared-types";
import { FC } from "react";
import { AdminChange } from "./AdminChanges";

export const ACTIONS_ADMIN = ["disable-rai-withdraw", "enable-rai-withdraw"];

export const AdminChanges: FC<opensearch.main.Document> = (props) => {
  const data = props.changelog?.filter((CL) =>
    ACTIONS_ADMIN.includes(CL._source.actionType)
  );

  if (!data?.length) return <></>;

  return (
    <DetailsSection
      id="admin-updates"
      title={`Administrative Package Changes (${data?.length})`}
      description="Administrative changes reflect updates to specific data fields. If you have additional questions, please contact the assigned CPOC."
    >
      <Accordion
        type="multiple"
        defaultValue={[data?.[0]._source.id as string]}
        className="flex flex-col mt-6 gap-2"
      >
        {data?.map((CL) => (
          <AdminChange {...CL._source} key={CL._source.id} />
        ))}
      </Accordion>
    </DetailsSection>
  );
};
