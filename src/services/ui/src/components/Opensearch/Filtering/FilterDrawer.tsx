import { FilterIcon } from "lucide-react";
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
import { Button } from "@/components/Inputs";
import { checkMultiFilter, resetFilters } from "../utils";
import { useOsParams } from "../useOpensearch";

export const OsFilterDrawer = () => {
  const hook = useFilterDrawer();
  const params = useOsParams();

  const filtersExist = checkMultiFilter(params.state.filters, 1);
  return (
    <Sheet open={hook.drawerOpen} onOpenChange={hook.setDrawerState}>
      <SheetTrigger>
        <div className="flex flex-row gap-2 items-center border-slate-100 px-4">
          <FilterIcon className="w-4 h-4" />
          <p className="prose-sm">Filters</p>
        </div>
      </SheetTrigger>
      <SheetContent className="bg-white overflow-scroll">
        <SheetHeader>
          <h4 className="prose-2xl">Filters</h4>
        </SheetHeader>
        <Button
          className="w-full my-2"
          variant="outline"
          disabled={!filtersExist}
          onClick={() => resetFilters(params.onSet)}
        >
          Reset
        </Button>
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
                    onChange={hook.onFilterChange(PK.field)}
                    options={hook.aggs?.[PK.field]}
                  />
                )}
                {PK.component === "multiCheck" && (
                  <FilterableCheckbox
                    value={hook.filters[PK.field]?.value as string[]}
                    onChange={hook.onFilterChange(PK.field)}
                    options={hook.aggs?.[PK.field]}
                  />
                )}
                {PK.component === "dateRange" && (
                  <FilterableDateRange
                    value={hook.filters[PK.field]?.value as OsRangeValue}
                    onChange={hook.onFilterChange(PK.field)}
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
