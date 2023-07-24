import { useSearch, SearchData } from "../../api/useSearch";
import { format } from "date-fns";
import * as UI from "@enterprise-cmcs/macpro-ux-lib";
import { LoadingSpinner, ErrorAlert } from "@/components";
import { ChangeEvent, useEffect, useState } from "react";
import { SeatoolData } from "shared-types";
import { Link, redirect } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import { getUser } from "@/api/useGetUser";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

const loader = (queryClient: QueryClient) => {
  return async () => {
    if (!queryClient.getQueryData(["user"])) {
      await queryClient.fetchQuery({
        queryKey: ["user"],
        queryFn: () => getUser(),
      });
    }

    const isUser = queryClient.getQueryData(["user"]) as Awaited<
      ReturnType<typeof getUser>
    >;
    if (!isUser.user) {
      return redirect("/");
    }

    return isUser;
  };
};
export const dashboardLoader = loader;

// NOTE  code below not used, but its the only thing using the seatooldata type, so i dont want to remove the pattern
// Should we be using the seatool data type in the new data grid?
// Should we add a 'onemac' data type?

// export function Row({ record }: { record: SeatoolData }) {
//   let status = "Unknown"; // not sure what status to use or even what "record.SPW_STATUS[0].SPW_STATUS_DESC" is
//   if (record.SPW_STATUS && record.SPW_STATUS[0]) {
//     status = record.SPW_STATUS[0].SPW_STATUS_DESC;
//   }

//   return (
//     <tr key={record.ID}>
//       <UI.TH rowHeader>
//         <Link
//           className="cursor-pointer text-blue-600"
//           to={`/record?type=${encodeURIComponent(
//             record.PLAN_TYPE
//           )}&id=${encodeURIComponent(record.ID)}`}
//           target="_blank"
//         >
//           {record.ID}
//         </Link>
//       </UI.TH>
//       <UI.TD>
//         {formatDistance(new Date(record.SUBMISSION_DATE), new Date())} ago
//       </UI.TD>
//       <UI.TD>{record.PLAN_TYPE}</UI.TD>
//       <UI.TD>{record.STATE_CODE}</UI.TD>
//       <UI.TD>{status}</UI.TD>
//       <UI.TD
//         style={{
//           maxWidth: "260px",
//           overflow: "hidden",
//           textOverflow: "ellipsis",
//           whiteSpace: "nowrap",
//         }}
//       >
//         {record.STATE_PLAN.SUMMARY_MEMO}
//       </UI.TD>
//     </tr>
//   );
// }

export const Dashboard = () => {
  const [selectedState, setSelectedState] = useState("VA");
  const [rowSelectionModel, setRowSelectionModel] = useState<string>();
  const [searchText, setSearchText] = useState<string>("");
  const [searchData, setSearchData] = useState<SearchData[] | null>(null);
  const { mutateAsync, isLoading, error } = useSearch({
    // Optional: You can provide onSuccess and onError callbacks if needed.
    // onSuccess: (data) => {},
    // onError: (error) => {},
  });

  useEffect(() => {
    handleSearch(searchText);
  }, [selectedState]);

  const handleSearch = async (searchText: string) => {
    try {
      const data = await mutateAsync({
        selectedState,
        searchString: searchText,
      });

      setSearchData(data.hits);
    } catch (error) {
      console.error("Error occurred during search:", error);
    }
  };

  const handleStateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(event.target.value);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-screen-lg mx-auto px-4 lg:px-8">
      <div className="flex items-center justify-between my-4">
        <UI.Typography size="lg" as="h1">
          Dashboard
        </UI.Typography>

        <div>
          <label htmlFor="state-select">Select a state: </label>
          <select
            id="state-select"
            value={selectedState}
            onChange={handleStateChange}
          >
            <option value="VA">VA</option>
            <option value="OH">OH</option>
            <option value="SC">SC</option>
          </select>
        </div>
      </div>
      {error ? (
        <ErrorAlert error={error} />
      ) : (
        <div
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SearchForm
            handleSearch={handleSearch}
            setSearchText={setSearchText}
            searchText={searchText}
          />
          <DataGrid
            columns={[
              {
                field: "Transmittal ID Number (TIN)",
                hideable: false,
                flex: 1,
                renderCell(params) {
                  return (
                    <Link
                      className="cursor-pointer text-blue-600"
                      to={`/record?region=${encodeURIComponent(
                        params.row._source.seatool.STATE_PLAN.STATE_CODE
                      )}&id=${encodeURIComponent(params.row._id)}`}
                    >
                      {params.row._id}
                    </Link>
                  );
                },
              },
              {
                field: "Plan Type",
                flex: 1,
                valueGetter(params) {
                  return params.row._source.seatool.PLAN_TYPE;
                },
              },
              {
                field: "Status",
                flex: 1,
                valueGetter(params) {
                  let status = "Unknown"; // not sure what status to use or even what "record.SPW_STATUS[0].SPW_STATUS_DESC" is
                  if (
                    params.row._source.seatool.SPW_STATUS &&
                    params.row._source.seatool.SPW_STATUS[0]
                  ) {
                    status =
                      params.row._source.seatool.SPW_STATUS[0].SPW_STATUS_DESC;
                  }
                  return status;
                },
              },
              {
                field: "Submission Date",
                flex: 1,
                valueGetter(params) {
                  return format(
                    params.row._source.seatool.SUBMISSION_DATE,
                    "MM/dd/yyyy"
                  );
                },
              },
              {
                field: "Region",
                flex: 1,
                valueGetter(params) {
                  return params.row._source.seatool.REGION[0].REGION_NAME;
                },
              },
              {
                field: "Type",
                flex: 1,
                valueGetter(params) {
                  return params.row._source.programType;
                },
              },
              {
                field: "Memo",
                flex: 1,
                valueGetter(params) {
                  return params.row._source.seatool?.STATE_PLAN?.SUMMARY_MEMO;
                },
              },
            ]}
            rows={(searchData as SearchData[]) || []}
            getRowId={(row) => row._id}
            slots={{
              toolbar: GridToolbar,
            }}
            onRowSelectionModelChange={(newRowSelectionModel) => {
              setRowSelectionModel(newRowSelectionModel.toString());
            }}
            rowSelectionModel={rowSelectionModel}
            initialState={{
              ...{ searchData },
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[5, 10, 25]}
          />
        </div>
      )}
    </div>
  );
};

const SearchForm = ({
  handleSearch,
  searchText,
  setSearchText,
}: {
  handleSearch: (searchString: string) => Promise<void>;
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSearch(searchText);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
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
        />
      </div>
    </form>
  );
};
