import { type DateRange } from "react-day-picker";
import { Icon, Typography } from "@enterprise-cmcs/macpro-ux-lib";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/Sheet";
import { CheckboxGroup } from "@/components/Checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/Accordion";

import { FilterableSelect } from "./FilterableSelect";
import { FilterableDateRange } from "./FilterableDateRange";
import { useDrawer } from "./useFilterDrawer";
import { mapOsBucketToOption } from "./utils";
import { MOCK } from "./consts";

export const OsFilterDrawer = () => {
  const hook = useDrawer();
  // eventuallly I'll grab the buckets through

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
          onValueChange={(s) => hook.setAccordionValues(s)}
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
                          value={hook.getValue(YS.type, YS.field) as string[]}
                          onChange={hook.onChange(YS.type, YS.field)}
                          options={MOCK.aggregations[YS.field].buckets.map(
                            mapOsBucketToOption
                          )}
                        />
                      );
                    }

                    if (YS.component === "multiCheck") {
                      return (
                        <CheckboxGroup
                          value={hook.getValue(YS.type, YS.field) as string[]}
                          onChange={hook.onChange(YS.type, YS.field)}
                          options={MOCK.aggregations[YS.field].buckets.map(
                            mapOsBucketToOption
                          )}
                        />
                      );
                    }

                    if (YS.component === "dateRange") {
                      return (
                        <FilterableDateRange
                          value={hook.getValue(YS.type, YS.field) as DateRange}
                          onChange={(d) =>
                            hook.onChange(
                              YS.type,
                              YS.field
                            )({
                              gte: d.from?.toISOString(),
                              lte: d.to?.toISOString(),
                            })
                          }
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
