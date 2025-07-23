import * as React from "react";
import { InputProps } from "shared-types";

import { EditableText } from "@/components";

export const SplitSpaId = React.forwardRef<
  HTMLInputElement,
  InputProps & {
    spaId: string;
    suffix?: string;
    onValueChange: (value: string | number | readonly string[]) => void;
  }
>(({ spaId, suffix, onValueChange, ...props }, ref) => (
  <div className="items-center flex leading-[2.25]">
    <span>{spaId}</span>
    {suffix ? (
      <span className="flex">
        -
        <EditableText {...props} ref={ref} value={suffix} onValueChange={onValueChange} />
      </span>
    ) : (
      <span className="flex ml-1">
        (<span className="font-bold">Base SPA</span>)
      </span>
    )}
  </div>
));
