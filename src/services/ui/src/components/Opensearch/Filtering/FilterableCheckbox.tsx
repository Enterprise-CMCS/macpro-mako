import { Button } from "@/components/Button";
import { CheckboxGroup } from "@/components/Checkbox";

type Props = {
  value: string[];
  onChange: (val: string[]) => void;
  options: { label: string; value: string }[];
};

export const FilterableCheckbox = (props: Props) => {
  const onClear = () => {
    props.onChange([]);
  };

  const onSelectAll = () => {
    props.onChange(props.options.map((OPT) => OPT.value));
  };

  return (
    <>
      <div className="tw-flex tw-gap-2 tw-my-2">
        <Button size="sm" onClick={onSelectAll}>
          Select All
        </Button>
        <Button size="sm" variant="outline" onClick={onClear}>
          Clear
        </Button>
      </div>
      <CheckboxGroup {...props} />
    </>
  );
};
