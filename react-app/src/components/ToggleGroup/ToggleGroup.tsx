import { ToggleGroup as RadixToggleGroup } from "@radix-ui/react-toggle-group";
import React from "react";

import { cn } from "@/utils";

type ToggleGroupProps = React.ComponentProps<typeof RadixToggleGroup>;

const ToggleGroup = ({ className, children, ...props }: ToggleGroupProps) => {
  return (
    <RadixToggleGroup className={cn("ToggleGroup", className)} {...props}>
      {children}
    </RadixToggleGroup>
  );
};

export default ToggleGroup;
