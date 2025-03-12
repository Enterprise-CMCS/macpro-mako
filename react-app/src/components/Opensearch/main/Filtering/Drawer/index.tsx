import { FilterIcon } from "lucide-react";
import { opensearch } from "shared-types";

import * as F from "./Filterable";
import { useFilterDrawer } from "./hooks";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components";

export const OsFilterDrawer = () => {
  // how filterDrawerHook looks
  // filterDrawerHook: {accordionValues: {}, aggs: filter opts, drawer: drawer state, fitlers: name of filters & status's, filtersApplied: boolean,
  //                    onFilterChange, onFilterReset}
  const filterDrawerHook = useFilterDrawer();

  return (
    <Sheet
      open={filterDrawerHook.drawer.drawerOpen}
      onOpenChange={filterDrawerHook.drawer.setDrawerState}
    >
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="hover:bg-transparent w-full xs:w-fit self-center h-10 flex gap-2"
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
          disabled={!filterDrawerHook.filtersApplied}
          onClick={filterDrawerHook.onFilterReset}
        >
          Reset
        </Button>
        <Accordion
          value={filterDrawerHook.accordionValues}
          onValueChange={filterDrawerHook.onAccordionChange}
          type="multiple"
        >
          {Object.values(filterDrawerHook.filters).map((filter) => (
            <AccordionItem key={`filter-${filter.field}`} value={filter.field}>
              <AccordionTrigger className="underline">{filter.label}</AccordionTrigger>
              <AccordionContent className="px-0">
                {filter.component === "multiSelect" && (
                  <F.FilterableSelect
                    value={filterDrawerHook.filters[filter.field]?.value as string[]}
                    onChange={filterDrawerHook.onFilterChange(filter.field)}
                    options={filterDrawerHook.aggs?.[filter.field]}
                  />
                )}
                {filter.component === "multiCheck" && (
                  <F.FilterableMultiCheck
                    value={filterDrawerHook.filters[filter.field]?.value as string[]}
                    onChange={filterDrawerHook.onFilterChange(filter.field)}
                    options={filterDrawerHook.aggs?.[filter.field]}
                  />
                )}
                {filter.component === "dateRange" && (
                  <F.FilterableDateRange
                    value={filterDrawerHook.filters[filter.field]?.value as opensearch.RangeValue}
                    onChange={filterDrawerHook.onFilterChange(filter.field)}
                  />
                )}
                {filter.component === "boolean" && (
                  <F.FilterableBoolean
                    value={filterDrawerHook.filters[filter.field]?.value as boolean}
                    onChange={filterDrawerHook.onFilterChange(filter.field)}
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

export * from "./consts";
export * from "./hooks";
