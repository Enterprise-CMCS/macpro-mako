import { FilterIcon } from "lucide-react";
import { opensearch } from "shared-types";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  Button,
} from "@/components";

import * as F from "./Filterable";
import { useFilterDrawer } from "./hooks";

export const OsFilterDrawer = () => {
  const hook = useFilterDrawer();

  return (
    <Sheet
      open={hook.drawer.drawerOpen}
      onOpenChange={hook.drawer.setDrawerState}
    >
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="hover:bg-transparent self-center h-10 flex gap-2"
        >
          <FilterIcon className="w-4 h-4" />
          <span className="prose-sm">Filters</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-white overflow-scroll">
        <SheetHeader>
          <h4 className="prose-2xl">Filters</h4>
        </SheetHeader>
        <Button
          className="w-full my-2"
          variant="outline"
          disabled={!hook.filtersApplied}
          onClick={hook.onFilterReset}
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
                  <F.FilterableSelect
                    value={hook.filters[PK.field]?.value as string[]}
                    onChange={hook.onFilterChange(PK.field)}
                    options={hook.aggs?.[PK.field]}
                  />
                )}
                {PK.component === "multiCheck" && (
                  <F.FilterableMultiCheck
                    value={hook.filters[PK.field]?.value as string[]}
                    onChange={hook.onFilterChange(PK.field)}
                    options={hook.aggs?.[PK.field]}
                  />
                )}
                {PK.component === "dateRange" && (
                  <F.FilterableDateRange
                    value={
                      hook.filters[PK.field]?.value as opensearch.RangeValue
                    }
                    onChange={hook.onFilterChange(PK.field)}
                  />
                )}
                {PK.component === "boolean" && (
                  <>
                    <F.FilterableBoolean
                      value={hook.filters[PK.field]?.value as boolean}
                      onChange={hook.onFilterChange(PK.field)}
                    />
                  </>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </SheetContent>
    </Sheet>
  );
};

export * from "./consts";
export * from "./hooks";
