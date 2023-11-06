import { useDebounce } from "@/hooks";
import { XIcon } from "lucide-react";
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
    <form onSubmit={handleSubmit} className="flex-1">
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute top-0 bottom-0 w-6 h-6 my-auto text-gray-400 left-3"
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
        <label htmlFor="searchInput" className="sr-only">
          Search by Package ID, CPOC Name, or Submitter Name
        </label>
        <input
          id="searchInput"
          type="text"
          placeholder="Search by Package ID, CPOC Name, or Submitter Name"
          className="w-full py-3 pl-12 pr-4 text-gray-500 border border-gray-300 outline-none focus:bg-white focus:border-indigo-600"
          value={searchText}
          onChange={handleInputChange}
          disabled={disabled}
        />
        {isSearching && (
          <motion.div
            className="absolute inset-y-0 w-6 h-6 my-auto right-9 origin-center flex items-center justify-center"
            animate={{ rotate: "360deg" }}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            <Loader className="w-4 h-4 text-slate-950" />
          </motion.div>
        )}
        {!!searchText && (
          <XIcon
            className="absolute cursor-pointer top-0 bottom-0 w-6 h-6 my-auto right-3"
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
