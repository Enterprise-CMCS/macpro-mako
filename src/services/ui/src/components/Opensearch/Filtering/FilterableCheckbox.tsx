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
      <div className="flex gap-2 my-2">
        <Button size="sm" className="text-white" onClick={onSelectAll}>
          Select All
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="hover:text-white"
          onClick={onClear}
        >
          Clear
        </Button>
      </div>
      <CheckboxGroup {...props} />
    </>
  );
};
