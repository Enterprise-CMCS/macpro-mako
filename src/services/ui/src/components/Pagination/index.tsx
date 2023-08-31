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
    <div className="tw-flex tw-items-center tw-justify-between tw-border-t tw-border-gray-200 tw-bg-white tw-py-3">
      <div className="tw-flex tw-flex-1 tw-justify-between sm:tw-hidden">
        <div className="tw-relative tw-inline-flex tw-items-center tw-rounded-md tw-border tw-border-gray-300 tw-bg-white tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-gray-700 hover:tw-bg-gray-50">
          Previous
        </div>
        <div className="tw-relative tw-ml-3 tw-inline-flex tw-items-center tw-rounded-md tw-border tw-border-gray-300 tw-bg-white tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-gray-700 hover:tw-bg-gray-50">
          Next
        </div>
      </div>
      <div className="tw-hidden sm:tw-flex sm:tw-flex-1 sm:tw-items-center sm:tw-justify-between">
        <div className="tw-flex tw-gap-6">
          <p className="tw-flex tw-gap-2 tw-text-sm tw-text-gray-700">
            items per page:
            <select
              className="tw-font-bold tw-cursor-pointer border-[1px] mt-[-1px]"
              value={props.pageSize}
              onChange={(e) => props.onSizeChange?.(Number(e.target.value))}
            >
              {[25, 50, 100].map((SIZE) => (
                <option key={`size-${SIZE}`}>{SIZE}</option>
              ))}
            </select>
          </p>
          <p className="tw-flex tw-gap-1 tw-text-sm tw-text-gray-700">
            <span className="tw-font-bold">{state.lowerBoundValue}</span>-
            <span className="tw-font-bold">{state.upperBoundValue}</span>
            of
            <span className="tw-font-bold">{props.count}</span>
            items
          </p>
        </div>
        <div>
          <nav
            className="isolate tw-inline-flex tw--space-x-px tw-rounded-md tw-shadow-sm"
            aria-label="Pagination"
          >
            <button
              onClick={() => props.onPageChange(props.pageNumber - 1)}
              disabled={state.prevDisabled}
              className="tw-relative tw-inline-flex tw-items-center tw-rounded-l-md tw-px-2 tw-py-2 tw-text-gray-400 tw-ring-1 tw-ring-inset tw-ring-gray-300 hover:tw-bg-gray-50 focus:tw-z-20 focus:outline-offset-0"
            >
              <span className="tw-sr-only">Previous</span>
              <svg
                className="tw-h-5 tw-w-5"
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
                      className="tw-absolute tw-w-auto tw-h-auto tw-opacity-0 tw-cursor-pointer"
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
                    "tw-relative tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-gray-900 tw-ring-1 tw-ring-inset tw-ring-gray-300 hover:tw-bg-gray-50 focus:tw-z-20 focus:outline-offset-0",
                    {
                      "tw-bg-blue-500": isActive,
                      "focus-visible:outline-indigo-600": isActive,
                      "tw-text-white": isActive,
                      "hover:tw-bg-blue-500": isActive,
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
              className="tw-relative tw-inline-flex tw-items-center tw-rounded-r-md tw-px-2 tw-py-2 tw-text-gray-400 tw-ring-1 tw-ring-inset tw-ring-gray-300 hover:tw-bg-gray-50 focus:tw-z-20 focus:outline-offset-0"
            >
              <span className="tw-sr-only">Next</span>
              <svg
                className="tw-h-5 tw-w-5"
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
