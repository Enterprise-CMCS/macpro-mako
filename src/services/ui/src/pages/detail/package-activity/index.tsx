import { Accordion, DetailsSection } from "@/components";
import { opensearch } from "shared-types";
import { FC } from "react";
import { PackageActivity } from "./PackageActivity";
import { Button } from "@/components/Inputs";
import { Loader2 } from "lucide-react";
import { usePackageActivities } from "./hook";

export const PackageActivities: FC<opensearch.main.Document> = (props) => {
  const hook = usePackageActivities(props);

  return (
    <DetailsSection
      id="attachments"
      title={
        <div className="flex justify-between">
          {`Package Activity (${hook.data?.length})`}
          <Button onClick={hook.onDownloadAll} variant="outline">
            {hook.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Download all documents
          </Button>
        </div>
      }
    >
      {!hook.data?.length && <p className="text-gray-500">-- no logs --</p>}
      <Accordion
        type="multiple"
        className="flex flex-col gap-2"
        defaultValue={hook.accordianDefault}
      >
        {hook.data?.map((CL) => (
          <PackageActivity {...CL._source} key={CL._source.id} />
        ))}
      </Accordion>
    </DetailsSection>
  );
};
