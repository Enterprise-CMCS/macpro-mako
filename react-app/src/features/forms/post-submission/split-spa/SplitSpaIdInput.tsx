import * as React from "react";
import { InputProps } from "shared-types";

import { EditableText } from "@/components";

export const SplitSpaIdInput = React.forwardRef<
  HTMLInputElement,
  InputProps & {
    spaId: string;
    suffix?: string;
    onChange: (...event: any[]) => void;
  }
>(({ spaId, suffix, onChange, ...props }, ref) => (
  <div className="items-center flex leading-[2.25]">
    <span>{spaId}</span>
    {!suffix ? (
      <span className="flex ml-1">
        (<span className="font-bold">Base SPA</span>)
      </span>
    ) : (
      <span className="flex">
        -
        <EditableText
          {...props}
          ref={ref}
          value={suffix}
          onValueChange={(value) =>
            onChange({
              event: {
                target: {
                  value: `${spaId}-${value}`,
                },
              },
            })
          }
        />
      </span>
    )}
  </div>
));
