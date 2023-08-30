import { Icon } from "@enterprise-cmcs/macpro-ux-lib";

export const SearchForm = ({
  handleSearch,
  searchText,
  setSearchText,
  disabled,
}: {
  handleSearch: (searchString: string) => Promise<void>;
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  disabled: boolean;
}) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSearch(searchText);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
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
          placeholder="Search"
          className="tw-w-full tw-py-3 tw-pl-12 tw-pr-4 tw-text-gray-500 tw-border tw-border-gray-300 tw-outline-none focus:tw-bg-white focus:tw-border-indigo-600"
          value={searchText}
          onChange={handleInputChange}
          disabled={disabled}
        />
        {!!searchText && (
          <Icon
            className="tw-absolute tw-cursor-pointer tw-top-0 tw-bottom-0 tw-w-6 tw-h-6 tw-my-auto tw-right-3"
            onClick={() => handleSearch("")}
            name="close"
          />
        )}
      </div>
    </form>
  );
};
