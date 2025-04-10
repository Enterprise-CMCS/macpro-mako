import { Button, CheckboxGroup } from "@/components";

type Props = {
  value: string[];
  onChange: (val: string[]) => void;
  options: { label: string; value: string }[];
};

export const FilterableMultiCheck = (props: Props) => {
  const onClear = () => {
    props.onChange([]);
  };

  const onSelectAll = () => {
    props.onChange(props.options.map((OPT) => OPT.value));
  };

  return (
    <>
      <div className="flex gap-2 my-2">
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
