import { Button, CheckboxGroup } from "@/components";

type Props = {
  label: string;
  value: string[];
  onChange: (val: string[]) => void;
  options: { label: string; value: string; id: string }[];
  legend?: string;
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
        <Button size="sm" onClick={onSelectAll} aria-label={`Select all ${props.label} options`}>
          Select All
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onClear}
          aria-label={`Clear all ${props.label} options`}
        >
          Clear
        </Button>
      </div>
      <CheckboxGroup {...props} />
    </>
  );
};
