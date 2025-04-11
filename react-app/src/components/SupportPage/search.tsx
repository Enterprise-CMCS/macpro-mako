import { XIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components";
import { cn } from "@/utils";

interface searchProps {
  handleSearch: (s: string) => void;
  placeholderText: string;
}

const Search = ({ handleSearch, placeholderText }: searchProps) => {
  const [searchText, setSearchText] = useState("");

  const handleButtonClick = () => {
    handleSearch(searchText);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updateText = event.target.value;
    setSearchText(updateText);
  };

  const isHidden = searchText ? "visible" : "invisible";

  return (
    <div className="flex items-center">
      <form>
        <div className="flex items-center border-gray-500 bg-white mr-5 lg:w-[25rem]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 mx-2 text-gray-500"
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
          <div className="border-l h-10 mr-2 border-gray-500"></div>
          <input
            id="searchInput"
            type="text"
            className="w-full py-2 text-gray-500 outline-none focus:bg-white placeholder:italic"
            maxLength={28}
            value={searchText}
            onChange={handleInputChange}
            placeholder={placeholderText}
          />

          <XIcon
            className={cn("text-gray-500 mr-2 cursor-pointer", isHidden)}
            data-testid="close-icon"
            onClick={() => {
              setSearchText("");
              handleSearch("");
            }}
            name="close"
          />
        </div>
      </form>
      <Button
        onClick={handleButtonClick}
        variant="outline"
        className="bg-white rounded-sm border-2 hover:border-white hover:text-white"
      >
        Search
      </Button>
    </div>
  );
};

export default Search;
