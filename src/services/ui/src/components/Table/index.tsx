import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@enterprise-cmcs/macpro-ux-lib";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <div className="tw-w-full tw-overflow-auto">
    <table
      ref={ref}
      className={cn("tw-w-full tw-caption-bottom tw-text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:tw-border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:tw-border-0", className)}
    {...props}
  />
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
    className={cn(
      "tw-bg-primary tw-font-medium tw-text-primary-foreground",
      className
    )}
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
      "tw-border-b tw-transition-colors hover:tw-bg-muted/50 data-[state=selected]:tw-bg-muted",
      className
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
>(({ className, children, icon, isActive, desc, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "tw-h-12 tw-px-4 tw-text-left tw-align-middle tw-font-bold tw-text-base tw-text-muted-foreground [&:has([role=checkbox])]:tw-pr-0",
      className,
      { "cursor-pointer": !!props?.onClick }
    )}
    {...props}
  >
    <div className="tw-flex">
      {children}
      {icon ? (
        icon
      ) : (
        <Icon
          name={desc ? "arrow_downward" : "arrow_upward"}
          className={cn(".1em", { "tw-opacity-0": !isActive })}
        />
      )}
    </div>
  </th>
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "tw-p-4 tw-align-middle [&:has([role=checkbox])]:tw-pr-0",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("tw-mt-4 tw-text-sm tw-text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
