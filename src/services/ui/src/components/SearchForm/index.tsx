import { Icon } from "@enterprise-cmcs/macpro-ux-lib";
import { FC, useState } from "react";

export const SearchForm: FC<{
  handleSearch: (s: string) => void;
  disabled: boolean;
}> = ({ handleSearch, disabled }) => {
  const [searchText, setSearchText] = useState("");

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
        <input
          type="text"
          placeholder="Search"
          className="w-full py-3 pl-12 pr-4 text-gray-500 border border-gray-300 outline-none focus:bg-white focus:border-indigo-600"
          value={searchText}
          onChange={handleInputChange}
          disabled={disabled}
        />
        {!!searchText && (
          <Icon
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
