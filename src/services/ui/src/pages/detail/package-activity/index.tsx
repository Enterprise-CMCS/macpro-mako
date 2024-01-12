import { Accordion, DetailsSection } from "@/components";
import { opensearch } from "shared-types";
import { FC, useMemo } from "react";
import { PackageActivity } from "./PackageActivity";
import { Button } from "@/components/Inputs";
import { useAttachmentService } from "./hook";
import { Loader2 } from "lucide-react";

export const ACTIONS_PA = [
  "new-submission",
  "withdraw-rai",
  "withdraw-package",
  "issue-rai",
  "respond-to-rai",
];

export const PackageActivities: FC<opensearch.main.Document> = (props) => {
  const hook = useAttachmentService({ packageId: props.id });
  const data = useMemo(
    () =>
      props.changelog?.filter((CL) =>
        ACTIONS_PA.includes(CL._source.actionType)
      ),
    [props.changelog]
  );

  const onDownloadAll = () => {
    const attachments = props.changelog?.reduce((ACC, ATT) => {
      if (!ATT._source.attachments) return ACC;
      return ACC.concat(ATT._source.attachments);
    }, [] as any);

    if (!attachments.length) return;

    hook.onZip(attachments);
  };

  return (
    <DetailsSection
      id="attachments"
      title={
        <div className="flex justify-between">
          {`Package Activity (${data?.length})`}
          <Button onClick={onDownloadAll} variant="outline">
            {hook.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Download all documents
          </Button>
        </div>
      }
    >
      {!data?.length && <p className="text-gray-500">-- no logs --</p>}
      <Accordion type="multiple" className="flex flex-col gap-2">
        {data?.map((CL) => (
          <PackageActivity {...CL._source} key={CL._source.id} />
        ))}
      </Accordion>
    </DetailsSection>
  );
};
