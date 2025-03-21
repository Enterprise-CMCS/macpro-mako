import { ToggleGroupItem as RadixToggleGroupItem } from "@radix-ui/react-toggle-group";
import React from "react";

import { cn } from "@/utils";

type ToggleGroupItemProps = React.ComponentProps<typeof RadixToggleGroupItem> & {
  className?: string;
};

const ToggleGroupItem = ({ className, ...props }: ToggleGroupItemProps) => {
  const toggleGroupItemStyle =
    "inline-flex items-center justify-center px-3 py-1.5 text-2xl bg-neutral-100 rounded-xs ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus:outline-none disabled:pointer-events-none disabled:opacity-50 border-b-4 border-b-transparent";

  const toggleGroupItemActiveStyle =
    "data-[state=on]:border-b-primary-dark data-[state=on]:bg-blue-50 data-[state=on]:text-primary-dark data-[state=on]:font-bold";

  return (
    <RadixToggleGroupItem
      className={cn(toggleGroupItemStyle, toggleGroupItemActiveStyle, className)}
      {...props}
    />
  );
};

export default ToggleGroupItem;
