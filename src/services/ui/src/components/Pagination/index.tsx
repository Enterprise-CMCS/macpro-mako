import { FC } from "react";
import type { Props } from "./types";

import { pageStateResolver } from "./utils";
import { cn } from "@/lib/utils";

export const Pagination: FC<Props> = (props) => {
  const state = pageStateResolver({
    pageNumber: props.pageNumber,
    pageSize: props.pageSize,
    count: props.count,
  });

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white py-3">
      <div className="flex flex-1 justify-between sm:hidden">
        <div className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Previous
        </div>
        <div className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Next
        </div>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div className="flex gap-6">
          <p className="flex gap-2 text-sm text-gray-700">
            Records per page:
            <select
              className="font-bold cursor-pointer border-[1px] mt-[-1px]"
              value={props.pageSize}
              onChange={(e) => props.onSizeChange?.(Number(e.target.value))}
            >
              {[25, 50, 100].map((SIZE) => (
                <option key={`size-${SIZE}`}>{SIZE}</option>
              ))}
            </select>
          </p>
          <p className="flex gap-1 text-sm text-gray-700">
            <span className="font-bold">{state.lowerBoundValue}</span>-
            <span className="font-bold">{state.upperBoundValue}</span>
            of
            <span className="font-bold">{props.count}</span>
            records
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              onClick={() => props.onPageChange(props.pageNumber - 1)}
              disabled={state.prevDisabled}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              <span className="sr-only">Previous</span>
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {state.pageRange.map((PAGE) => {
              if (Array.isArray(PAGE))
                return (
                  <button
                    key={`PAGE-${PAGE}`}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0 cursor-pointer"
                  >
                    ...
                    <select
                      onChange={(v) =>
                        props.onPageChange(Number(v.currentTarget.value) - 1)
                      }
                      className="absolute w-auto h-auto opacity-0 cursor-pointer"
                    >
                      {PAGE.map((P) => (
                        <option key={`child-page-${P}`} value={P}>
                          {P}
                        </option>
                      ))}
                    </select>
                  </button>
                );

              const isActive = props.pageNumber === PAGE - 1;
              return (
                <button
                  key={`PAGE-${PAGE}`}
                  onClick={() => props.onPageChange(PAGE - 1)}
                  className={cn(
                    "relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0",
                    {
                      "bg-blue-700": isActive,
                      "focus-visible:outline-indigo-600": isActive,
                      "text-white": isActive,
                      "hover:text-black": isActive,
                      "hover:bg-blue-700": isActive,
                    }
                  )}
                >
                  {PAGE}
                </button>
              );
            })}

            <button
              disabled={state.nextDisabled}
              onClick={() => props.onPageChange(props.pageNumber + 1)}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              <span className="sr-only">Next</span>
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};
