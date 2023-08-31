import { Icon, Typography } from "@enterprise-cmcs/macpro-ux-lib";
import { OsRangeValue } from "shared-types";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/Sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/Accordion";

import { FilterableSelect } from "./FilterableSelect";
import { FilterableDateRange } from "./FilterableDateRange";
import { FilterableCheckbox } from "./FilterableCheckbox";
import { useFilterDrawer } from "./useFilterDrawer";

export const OsFilterDrawer = () => {
  const hook = useFilterDrawer();

  return (
    <Sheet open={hook.open} onOpenChange={hook.onClose}>
      <SheetTrigger>
        <div className="flex flex-row item-center border-slate-100 px-4">
          <Icon name="filter_list" />
          <Typography size="md">Filters</Typography>
        </div>
      </SheetTrigger>
      <SheetContent className="bg-white">
        <SheetHeader>
          <Typography size="lg">Filters</Typography>
        </SheetHeader>
        <Accordion
          value={hook.accordionValues}
          onValueChange={hook.onAccordionChange}
          type="multiple"
        >
          {Object.values(hook.filters).map((PK) => (
            <AccordionItem key={`filter-${PK.field}`} value={PK.field}>
              <AccordionTrigger className="underline">
                {PK.label}
              </AccordionTrigger>
              <AccordionContent>
                {PK.component === "multiSelect" && (
                  <FilterableSelect
                    value={hook.filters[PK.field]?.value as string[]}
                    onChange={hook.onChange(PK.field)}
                    options={hook.aggs?.[PK.field]}
                  />
                )}
                {PK.component === "multiCheck" && (
                  <FilterableCheckbox
                    value={hook.filters[PK.field]?.value as string[]}
                    onChange={hook.onChange(PK.field)}
                    options={hook.aggs?.[PK.field]}
                  />
                )}
                {PK.component === "dateRange" && (
                  <FilterableDateRange
                    value={hook.filters[PK.field]?.value as OsRangeValue}
                    onChange={hook.onChange(PK.field)}
                  />
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </SheetContent>
    </Sheet>
  );
};
