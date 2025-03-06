import { useCallback, useState } from "react";
import { Plus as PlusIcon, Minus as MinusIcon } from "lucide-react";
import { Button } from "@/components";

const ExpandCollapseBtn = (props: { expandAll: () => void; collapseAll: () => void }) => {
  const [areAllOpen, setAreAllOpen] = useState<boolean>(false);

  const callBack = useCallback(() => {
    if (areAllOpen) {
      props.collapseAll();
      setAreAllOpen(false);
      return;
    } else {
      props.expandAll();
      setAreAllOpen(true);
    }
  }, [props, areAllOpen, setAreAllOpen]);

  return (
    <Button
      onClick={callBack}
      variant="link"
      data-testid="expand-all"
      className="w-full xs:w-fit hover:bg-transparent"
    >
      <span>{areAllOpen ? "Collapse all" : "Expand all"}</span>
      {areAllOpen ? <MinusIcon /> : <PlusIcon />}
    </Button>
  );
};

export default ExpandCollapseBtn;
