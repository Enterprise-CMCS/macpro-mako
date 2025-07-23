import { Check, Pencil, X } from "lucide-react";
import * as React from "react";
import { InputProps } from "shared-types";

import { Input as BaseInput } from "@/components";
import { cn } from "@/utils";

interface EditableTextProps extends InputProps {
  className?: string;
  value: string | number | readonly string[];
  onValueChange: (value: string | number | readonly string[]) => void;
}

const Wrapper = ({ className, children }) => (
  <div className={cn(className, "flex gap-x-4 items-center leading-[2.25]")}>{children}</div>
);

const EditableText = React.forwardRef<HTMLInputElement, EditableTextProps>(
  ({ className, value, onValueChange, ...props }, ref) => {
    const [edit, setEdit] = React.useState<boolean>(false);
    const [newValue, setNewValue] = React.useState<string | number | readonly string[]>(value);

    if (edit) {
      return (
        <Wrapper className={className}>
          <BaseInput
            {...props}
            value={newValue}
            onChange={(event) => setNewValue(event.target.value)}
            ref={ref}
          />
          <button
            onClick={() => {
              onValueChange(newValue);
              setEdit(false);
            }}
            aria-label="Save"
          >
            <Check className="text-[#0071BC]" />
          </button>
          <button
            onClick={() => {
              setNewValue(value);
              setEdit(false);
            }}
            aria-label="Cancel"
          >
            <X />
          </button>
        </Wrapper>
      );
    }

    return (
      <Wrapper className={className}>
        <span>{newValue}</span>
        <button onClick={() => setEdit(true)} aria-label="Edit">
          <Pencil />
        </button>
      </Wrapper>
    );
  },
);

EditableText.displayName = "EditableText";

export { EditableText };
