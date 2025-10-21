import { ArrowDown, ArrowUp } from "lucide-react";
import * as React from "react";

import { cn } from "@/utils";

// Table Docs - https://ui.shadcn.com/docs/components/table
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <div className="w-full border-[1px] overflow-auto p-0.5">
    <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("bg-primary font-medium text-primary-foreground", className)}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted text-sm",
      className,
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & {
    onClick?: () => void;
    className?: string;
    isActive?: boolean;
    icon?: React.ReactNode;
    desc?: boolean;
  }
>(({ className, children, icon, isActive, desc, ...props }, ref) => {
  const sortable = !!props.onClick;

  const content = (
    <div className="flex items-center gap-1">
      {children}
      {icon ? (
        icon
      ) : (
        <>
          {desc && (
            <ArrowDown
              className={cn(".1em w-5 h-5", { "opacity-0": !isActive })}
              aria-hidden="true"
            />
          )}
          {!desc && (
            <ArrowUp
              className={cn(".1em w-5 h-5", { "opacity-0": !isActive })}
              aria-hidden="true"
            />
          )}
        </>
      )}
    </div>
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTableCellElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      props.onClick?.();
    }
  };

  return (
    <th
      ref={ref}
      scope="col"
      aria-sort={isActive ? (desc ? "descending" : "ascending") : "none"}
      className={cn(
        "px-4 pl-2 text-left font-semibold text-muted-foreground [&:has([role=checkbox])]:pr-0 leading-5",
        className,
        { "cursor-pointer": sortable },
      )}
      tabIndex={sortable ? 0 : undefined}
      onKeyDown={sortable ? handleKeyDown : undefined}
      {...props}
    >
      {content}
    </th>
  );
});
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn("px-2 py-3 text-left align-middle  text-sm", className)} {...props} />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
));
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
