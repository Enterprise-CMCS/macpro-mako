import { FC, useMemo } from "react";
import { opensearch } from "shared-types";
import { format } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  DetailsSection,
} from "@/components";
import { BLANK_VALUE } from "@/consts";
import { usePackageDetailsCache } from "..";

export const AC_WithdrawEnabled: FC<opensearch.changelog.Document> = (
  props,
) => {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-bold">Change made</p>
      <p>
        {props.submitterName} has enabled State package action to withdraw
        formal RAI response
      </p>
    </div>
  );
};

export const AC_WithdrawDisabled: FC<opensearch.changelog.Document> = (
  props,
) => {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-bold">Change made</p>
      <p>
        {props.submitterName} has disabled State package action to withdraw
        formal RAI response
      </p>
    </div>
  );
};

export const AC_LegacyManualUpdate: FC<opensearch.changelog.Document> = (
  props,
) => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-bold text-lg mb-2">Change Made</h2>
        <p>{props.changeMade || "No information submitted"}</p>
      </div>
    </div>
  );
};

export const AC_Update: FC<opensearch.changelog.Document> = () => {
  return <p>Coming Soon</p>;
};

export const AdminChange: FC<opensearch.changelog.Document> = (props) => {
  console.log(props.actionType);
  const [label, Content] = useMemo(() => {
    switch (props.actionType) {
      case "disable-rai-withdraw":
        return ["Disable formal RAI response withdraw", AC_WithdrawDisabled];
      case "enable-rai-withdraw":
        return ["Enable formal RAI response withdraw", AC_WithdrawEnabled];
      case "legacy-manual-update":
        return ["Manual Update", AC_LegacyManualUpdate];
      default:
        return [BLANK_VALUE, AC_Update];
    }
  }, [props.actionType]);

  return (
    <AccordionItem key={props.id} value={props.id}>
      <AccordionTrigger className="bg-gray-100 px-3">
        <p className="flex flex-row gap-2 text-gray-600">
          <strong>{label as string}</strong>
          {" - "}
          {format(new Date(props.timestamp), "eee, MMM d, yyyy hh:mm:ss a")}
        </p>
      </AccordionTrigger>
      <AccordionContent className="p-4">
        <Content {...props} />
      </AccordionContent>
    </AccordionItem>
  );
};

export const AdminChanges = () => {
  const cache = usePackageDetailsCache();
  const data = cache.data.changelog?.filter((CL) =>
    [
      "disable-rai-withdraw",
      "enable-rai-withdraw",
      "legacy-manual-update",
    ].includes(CL._source.actionType),
  );

  if (!data?.length) return <></>;

  return (
    <DetailsSection
      id="administrative_package_changess"
      title={`Administrative Package Changes (${data?.length})`}
      description="Administrative changes reflect updates to specific data fields. If you have additional questions, please contact the assigned CPOC."
    >
      <Accordion
        type="multiple"
        defaultValue={[data?.[0]._source.id as string]}
        className="flex flex-col mt-6 gap-2"
      >
        {data?.map((CL) => <AdminChange {...CL._source} key={CL._source.id} />)}
      </Accordion>
    </DetailsSection>
  );
};
