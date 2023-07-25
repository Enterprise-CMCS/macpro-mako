import { useSearch, SearchData } from "../../api/useSearch";
import { format } from "date-fns";
import * as UI from "@enterprise-cmcs/macpro-ux-lib";
import { LoadingSpinner, ErrorAlert, SearchForm } from "@/components";
import { ChangeEvent, useEffect, useState } from "react";
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
          <UI.Tabs>
            <UI.TabPanel id="tab-panel--summary" tabLabel="Waivers">
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
                          params.row._source.seatool.SPW_STATUS[0]
                            .SPW_STATUS_DESC;
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
                      return params.row._source.seatool?.STATE_PLAN
                        ?.SUMMARY_MEMO;
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
            </UI.TabPanel>
            <UI.TabPanel id="tab-panel--summary" tabLabel="SPAs">
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
                          params.row._source.seatool.SPW_STATUS[0]
                            .SPW_STATUS_DESC;
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
                      return params.row._source.seatool?.STATE_PLAN
                        ?.SUMMARY_MEMO;
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
            </UI.TabPanel>
          </UI.Tabs>
        </div>
      )}
    </div>
  );
};
