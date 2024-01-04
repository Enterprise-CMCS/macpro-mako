import { Accordion, DetailsSection } from "@/components";
import { opensearch } from "shared-types";
import { FC } from "react";
import { PackageActivity } from "./PackageActivity";

export const ACTIONS_PA = [
  "new-submission",
  "withdraw-rai",
  "withdraw-package",
  "issue-rai",
  "respond-to-rai",
];

export const PackageActivities: FC<opensearch.main.Document> = (props) => {
  const data = props.changelog?.filter((CL) =>
    ACTIONS_PA.includes(CL._source.actionType)
  );

  return (
    <DetailsSection id="attachments" title="Package Activity">
      <Accordion type="multiple" className="flex flex-col gap-2">
        {data?.map((CL) => (
          <PackageActivity {...CL._source} key={CL._source.id} />
        ))}
      </Accordion>
    </DetailsSection>
  );
};
