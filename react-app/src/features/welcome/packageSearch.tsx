import LZ from "lz-string";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { Button, RadioGroup, RadioGroupItem } from "@/components";

export const PackageSearch = () => {
  const [searchText, setSearchText] = useState("");
  const [tabChoice, setTabChoice] = useState("spas");
  const navigate = useNavigate();

  const handleSearch = () => {
    const compressedValue = LZ.compressToEncodedURIComponent(
      JSON.stringify({
        filters: [],
        search: searchText,
        tab: tabChoice,
        pagination: { number: 0, size: 25 },
        sort: { field: "makoChangedDate", order: "desc" },
      }),
    );
    navigate(`/dashboard?os=${compressedValue}`);
  };

  return (
    <div className="w-full h-[202px] space-y-3 flex flex-col items-center text-center justify-center mb-8 mt-8">
      <p className="text-[24px] font-bold">Search for package</p>
      <p className="text-[16px]">
        You can search by SPA ID, waiver number, CPOC name, or submitter name.
      </p>
      <RadioGroup
        value={tabChoice}
        onValueChange={(e) => setTabChoice(e)}
        className="flex space-x-4"
      >
        <div className="flex space-x-2">
          <RadioGroupItem value="spas" id="r1" />
          <label htmlFor="r1">Search SPAs</label>
        </div>
        <div className="flex space-x-2">
          <RadioGroupItem value="waivers" id="r2" />
          <label htmlFor="r2">Search waivers</label>
        </div>
      </RadioGroup>
      <div className="flex items-center border rounded w-[434px]">
        <input
          className="flex h-9 w-full rounded-sm bg-transparent px-3 py-1 text-sm shadow-sm"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className="h-full border-l-2" />
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
      </div>
      <Button className="w-[304px]" onClick={handleSearch}>
        Search
      </Button>
    </div>
  );
};

export const BrowseDash = () => {
  return (
    <div className="w-full h-[202px] space-y-4 flex flex-col items-center text-center justify-center mb-8 mt-8">
      <p className="text-[24px] font-bold">Browse dashboard</p>
      <p className="text-[16px]">Find a complete list of packages on the dashboard.</p>
      <Link to={"/dashboard"}>
        <button className="w-[304px] h-[38px] bg-[#0071BC] text-white px-4 py-2 rounded-md text-sm font-semibold">
          Go to dashboard
        </button>
      </Link>
    </div>
  );
};
