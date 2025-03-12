import { Minus as MinusIcon, Plus as PlusIcon } from "lucide-react";

import { Button } from "@/components";

const ExpandCollapseBtn = (props: {
  expandAll: () => void;
  collapseAll: () => void;
  areAllOpen: boolean;
}) => {
  const callBack = () => {
    if (props.areAllOpen) {
      props.collapseAll();

      return;
    }
    props.expandAll();
    return;
  };

  return (
    <Button
      onClick={callBack}
      variant="link"
      data-testid="expand-all"
      className="w-full xs:w-fit hover:bg-transparent"
    >
      <span>{props.areAllOpen ? "Collapse all" : "Expand all"}</span>
      {props.areAllOpen ? <MinusIcon /> : <PlusIcon />}
    </Button>
  );
};

export default ExpandCollapseBtn;
