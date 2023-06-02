import * as UI from "@chakra-ui/react";
import { ElementType, ReactNode } from "react";
import { HiChevronDown } from "react-icons/hi";

export type FilterActionButtonsProps = {
  onClickCancel?: VoidFunction;
  isCancelDisabled?: boolean;
  onClickApply?: VoidFunction;
};

export const FilterActionButtons = (props: FilterActionButtonsProps) => {
  const { onClickApply, onClickCancel, isCancelDisabled } = props;
  return (
    <UI.HStack spacing="2" justify="space-between">
      <UI.Button
        size="sm"
        variant="ghost"
        onClick={onClickCancel}
        isDisabled={isCancelDisabled}
      >
        Cancel
      </UI.Button>
      <UI.Button size="sm" colorScheme="blue" onClick={onClickApply}>
        Save
      </UI.Button>
    </UI.HStack>
  );
};

type FilterPopoverButtonProps = {
  label: string;
  icon?: ElementType;
  selected?: boolean;
};

export const FilterPopoverButton = (props: FilterPopoverButtonProps) => {
  const { label, icon, selected } = props;

  return (
    <UI.PopoverTrigger>
      <UI.HStack
        justify="space-between"
        position="relative"
        as="button"
        fontSize="sm"
        borderWidth="1px"
        zIndex="11"
        rounded="lg"
        paddingStart="3"
        paddingEnd="2"
        paddingY="1.5"
        spacing="1"
        data-selected={selected || undefined}
        _expanded={{ bg: "gray.100" }}
        _selected={{ bg: "blue.50", borderColor: "blue.500" }}
      >
        {icon && <UI.Icon as={icon} boxSize="2" />}
        <UI.Text fontWeight="medium">{label}</UI.Text>
        <UI.Icon as={HiChevronDown} fontSize="xl" color="gray.400" />
      </UI.HStack>
    </UI.PopoverTrigger>
  );
};

type FilterPopoverContentProps = FilterActionButtonsProps & {
  header?: string;
  children?: ReactNode;
};

export const FilterPopoverContent = (props: FilterPopoverContentProps) => {
  const { children, onClickCancel, onClickApply, isCancelDisabled } = props;
  const { onClose } = UI.usePopoverContext();
  return (
    <UI.PopoverContent
      _focus={{ shadow: "none", outline: 0 }}
      _focusVisible={{ shadow: "outline" }}
    >
      <UI.PopoverBody padding="6">{children}</UI.PopoverBody>
      <UI.PopoverFooter>
        <FilterActionButtons
          onClickCancel={() => {
            onClickCancel?.();
            onClose();
          }}
          isCancelDisabled={isCancelDisabled}
          onClickApply={() => {
            onClickApply?.();
            onClose();
          }}
        />
      </UI.PopoverFooter>
    </UI.PopoverContent>
  );
};
