import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components";
import { opensearch } from "shared-types";
import { FC, useMemo } from "react";
import { BLANK_VALUE } from "@/consts";
import { format } from "date-fns";

export const AC_WithdrawEnabled: FC<opensearch.changelog.Document> = (
  props
) => {
  return (
    <p>
      {props.submitterName} has enabled package action to submit formal RAI
      response
    </p>
  );
};

export const AC_WithdrawDisabled: FC<opensearch.changelog.Document> = (
  props
) => {
  return (
    <p>
      {props.submitterName} has disabled package action to submit formal RAI
      response
    </p>
  );
};

export const AC_Update: FC<opensearch.changelog.Document> = () => {
  return <p>Coming Soon</p>;
};

const useAdminChange = (
  doc: opensearch.changelog.Document
): [string, FC<opensearch.changelog.Document>] => {
  return useMemo(() => {
    switch (doc.actionType) {
      case "disable-rai-withdraw":
        return ["Disabled formal RAI response withdraw", AC_WithdrawDisabled];
      case "enable-rai-withdraw":
        return ["Enabled formal RAI response withdraw", AC_WithdrawEnabled];
      case "update":
        return ["SPA ID update", AC_Update];
      default:
        return [BLANK_VALUE, AC_Update];
    }
  }, [doc.actionType]);
};

export const AdminChange: FC<opensearch.changelog.Document> = (props) => {
  const [label, Content] = useAdminChange(props);

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
