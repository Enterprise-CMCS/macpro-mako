import * as React from "react";
import { InputProps } from "shared-types";

import { EditableText } from "@/components";

export const SplitSpaIdInput = React.forwardRef<
  HTMLInputElement,
  InputProps & {
    spaId: string;
    value?: string;
    onChange: (...event: any[]) => void;
  }
>(({ spaId, value, onChange, ...props }, ref) => (
  <div className="items-center flex leading-[2.25]">
    <span>{spaId}</span>
    {!value ? (
      <span className="flex ml-1">
        (<span className="font-bold">Base SPA</span>)
      </span>
    ) : (
      <span className="flex">
        -
        <EditableText
          ref={ref}
          defaultValue={value}
          value={value}
          onValueChange={onChange}
          {...props}
        />
      </span>
    )}
  </div>
));
