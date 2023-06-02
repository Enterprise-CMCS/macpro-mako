import * as UI from "@chakra-ui/react";

type CheckboxFilterProps = Omit<UI.CheckboxGroupProps, "onChange"> & {
  options: Array<{ label: string; value: string; count?: number }>;
  label: string;
  onChange?: (value: string[]) => void;
  spacing?: UI.StackProps["spacing"];
  showSearch?: boolean;
};

export const CheckboxFilter = (props: CheckboxFilterProps) => {
  const { options, label, spacing = "2", showSearch, ...rest } = props;

  return (
    <UI.Stack as="fieldset" spacing={spacing}>
      <UI.FormLabel fontWeight="semibold" as="legend" mb="0">
        {label}
      </UI.FormLabel>
      <UI.CheckboxGroup {...rest}>
        {options.map((option) => (
          <UI.Checkbox
            key={option.value}
            value={option.value}
            colorScheme="blue"
          >
            <span>{option.label}</span>
            {option.count != null && (
              <UI.Box as="span" color="gray.500" fontSize="sm">
                {" "}
                ({option.count})
              </UI.Box>
            )}
          </UI.Checkbox>
        ))}
      </UI.CheckboxGroup>
    </UI.Stack>
  );
};
