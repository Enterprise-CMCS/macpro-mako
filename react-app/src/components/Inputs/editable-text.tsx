import { Check, Pencil, X } from "lucide-react";
import * as React from "react";
import { InputProps } from "shared-types";

import { Input } from "@/components";
import { cn } from "@/utils";

interface EditableTextProps extends InputProps {
  className?: string;
  label: string;
  value: string | number | readonly string[];
  onValueChange: (value: string | number | readonly string[]) => void;
}

const EditableText = React.forwardRef<HTMLInputElement, EditableTextProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, label, id, value, defaultValue, onValueChange, onChange, ...props }, ref) => {
    const [edit, setEdit] = React.useState<boolean>(false);
    const [newValue, setNewValue] = React.useState<string | number | readonly string[]>(value);

    return (
      <div className={cn(className, "flex gap-x-4 items-center leading-[2.25]")}>
        {edit ? (
          <>
            <Input
              ref={ref}
              key={id}
              type="text"
              value={newValue}
              onChange={(event) => setNewValue(event.target.value)}
              aria-label={label}
              {...props}
            />
            <button
              type="button"
              onClick={() => {
                onValueChange(newValue);
                setEdit(false);
              }}
              aria-label="Save"
            >
              <Check className="text-[#0071BC]" />
            </button>
            <button
              type="button"
              onClick={() => {
                setNewValue(value);
                setEdit(false);
              }}
              aria-label="Cancel"
            >
              <X />
            </button>
          </>
        ) : (
          <>
            <div ref={ref} {...props} className="text-left">
              {newValue}
            </div>
            <button type="button" onClick={() => setEdit(true)} aria-label="Edit">
              <Pencil />
            </button>
          </>
        )}
      </div>
    );
  },
);

EditableText.displayName = "EditableText";

export { EditableText };
