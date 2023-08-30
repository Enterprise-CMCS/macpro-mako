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
import { mapOsBucketToOption } from "./utils";

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
          {Object.entries(hook.filters).map(([GF, YS]) => {
            return (
              <AccordionItem key={`filter-${GF}`} value={GF}>
                <AccordionTrigger className="underline">
                  {YS.label}
                </AccordionTrigger>
                <AccordionContent>
                  {(() => {
                    if (YS.component === "multiSelect") {
                      return (
                        <FilterableSelect
                          value={hook.filters[YS.field]?.value as string[]}
                          onChange={hook.onChange(YS.field)}
                          options={
                            hook.aggs?.[YS.field]?.buckets?.map(
                              mapOsBucketToOption
                            ) || []
                          }
                        />
                      );
                    }

                    if (YS.component === "multiCheck") {
                      return (
                        <FilterableCheckbox
                          value={hook.filters[YS.field]?.value as string[]}
                          onChange={hook.onChange(YS.field)}
                          options={
                            hook.aggs?.[YS.field]?.buckets?.map(
                              mapOsBucketToOption
                            ) || []
                          }
                        />
                      );
                    }

                    if (YS.component === "dateRange") {
                      return (
                        <FilterableDateRange
                          value={hook.filters[YS.field]?.value as OsRangeValue}
                          onChange={hook.onChange(YS.field)}
                        />
                      );
                    }
                  })()}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </SheetContent>
    </Sheet>
  );
};
