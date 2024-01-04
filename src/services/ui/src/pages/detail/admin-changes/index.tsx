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
    <DetailsSection id="admin-updates" title="Admin Updates">
      <Accordion type="multiple" className="flex flex-col gap-2">
        {data?.map((CL) => (
          <AdminChange {...CL._source} key={CL._source.id} />
        ))}
      </Accordion>
    </DetailsSection>
  );
};
