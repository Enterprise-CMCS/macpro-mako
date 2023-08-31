import { useDebounce } from "@/hooks";
import { Icon } from "@enterprise-cmcs/macpro-ux-lib";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { FC, useEffect, useState } from "react";

export const SearchForm: FC<{
  handleSearch: (s: string) => void;
  isSearching: boolean;
  disabled: boolean;
}> = ({ handleSearch, disabled, isSearching }) => {
  const [searchText, setSearchText] = useState("");
  const debouncedSearchString = useDebounce(searchText, 750);

  useEffect(() => {
    handleSearch(debouncedSearchString);
  }, [debouncedSearchString]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSearch(searchText);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updateText = event.target.value;
    setSearchText(updateText);
    if (!updateText) handleSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className="tw-flex-1">
      <div className="tw-relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="tw-absolute tw-top-0 tw-bottom-0 tw-w-6 tw-h-6 tw-my-auto tw-text-gray-400 tw-left-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search by Package ID, CPOC Name, or Submitter Name"
          className="tw-w-full tw-py-3 tw-pl-12 tw-pr-4 tw-text-gray-500 tw-border tw-border-gray-300 tw-outline-none focus:tw-bg-white focus:tw-border-indigo-600"
          value={searchText}
          onChange={handleInputChange}
          disabled={disabled}
        />
        {isSearching && (
          <motion.div
            className="tw-absolute tw-inset-y-0 tw-w-6 tw-h-6 tw-my-auto tw-right-9 tw-origin-center tw-flex tw-items-center tw-justify-center"
            animate={{ rotate: "360deg" }}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            <Loader className="tw-w-4 tw-h-4 tw-text-slate-950" />
          </motion.div>
        )}
        {!!searchText && (
          <Icon
            className="tw-absolute tw-cursor-pointer tw-top-0 tw-bottom-0 tw-w-6 tw-h-6 tw-my-auto tw-right-3"
            onClick={() => {
              setSearchText("");
              handleSearch("");
            }}
            name="close"
          />
        )}
      </div>
    </form>
  );
};
