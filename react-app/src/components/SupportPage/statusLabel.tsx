import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils";

const statusLabelVariants = cva("px-2 mr-2 font-light text-white rounded-[2px]", {
  variants: {
    type: {
      New: "bg-blue-700",
      Updated: "bg-green-700",
    },
  },
  defaultVariants: {
    type: "New",
  },
});

export type StatusLabelVariant = "New" | "Updated";

interface StatusLabelProps extends VariantProps<typeof statusLabelVariants> {
  className?: string;
}

const StatusLabel = ({ type, className }: StatusLabelProps) => {
  return <span className={cn(statusLabelVariants({ type }), className)}>{type}</span>;
};

export default StatusLabel;
