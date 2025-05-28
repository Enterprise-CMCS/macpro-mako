import { Loader, XIcon } from "lucide-react";
import { FC, useEffect, useRef, useState } from "react";

import { useDebounce } from "@/hooks";
import { cn } from "@/utils";

import { Button, Input } from "../Inputs";
import { OsUrlState } from "../Opensearch";

export const SearchForm: FC<{
  handleSearch: (s: string) => void;
  urlState?: OsUrlState;
  isSearching: boolean;
  disabled: boolean;
}> = ({ handleSearch, urlState, disabled, isSearching }) => {
  const [searchText, setSearchText] = useState(urlState?.search ?? "");
  const debouncedSearchString = useDebounce(searchText, 750);
  const searchInputRef = useRef(null);

  useEffect(() => {
    handleSearch(debouncedSearchString);
  }, [debouncedSearchString]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSearch(searchText);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updateText = event.target.value;
    setSearchText(updateText);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative w-full lg:w-[30rem]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-y-0 w-6 h-6 my-auto text-gray-400 left-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <label htmlFor="search-input" className="sr-only">
          Search by Package ID, CPOC Name, or Submitter Name
        </label>
        <Input
          id="search-input"
          ref={searchInputRef}
          type="text"
          className="w-full h-auto py-3 pl-12 pr-10 !text-gray-500 border border-gray-300 rounded-none shadow-none text-inherit"
          maxLength={28}
          value={searchText}
          onChange={handleInputChange}
          disabled={disabled}
          placeholder="Search..."
        />
        <div className="flex items-center gap-x-1 absolute inset-y-0 right-0 pr-3">
          <Loader
            className={cn("w-4 h-4 text-slate-950 animate-spin", {
              hidden: isSearching === false,
            })}
          />
          {searchText && (
            <Button
              className="w-auto h-auto p-0"
              variant="ghost"
              type="button"
              aria-label="Clear search input"
              aria-controls="search-input"
              data-testid="clear-search-button"
              onClick={() => {
                setSearchText("");
                handleSearch("");
                if (searchInputRef.current) {
                  searchInputRef.current.focus();
                }
              }}
              disabled={disabled}
            >
              <XIcon className="w-6 h-6" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};
