import { useSearch } from "@/api";
import { useGetUser } from "@/api/useGetUser";
import { ErrorAlert, SearchForm } from "@/components";
import { removeUnderscoresAndCapitalize } from "@/utils";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStatus } from "./statusHelper";
import { SearchData } from "shared-types";

export const WaiversList = ({ selectedState }: { selectedState: string }) => {
  const [rowSelectionModel, setRowSelectionModel] = useState<string>();
  const [searchText, setSearchText] = useState<string>("");
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const { mutateAsync, isLoading, error } = useSearch();
  const { data: user } = useGetUser();

  useEffect(() => {
    handleSearch(searchText);
  }, [selectedState]);

  const handleSearch = async (searchText: string) => {
    try {
      const data = await mutateAsync({
        selectedState,
        searchString: searchText,
        authority: "WAIVER",
      });

      setSearchData(data);
    } catch (error) {
      console.error("Error occurred during search:", error);
    }
  };

  if (error) return <ErrorAlert error={error} />;

  return (
    <>
      <SearchForm
        handleSearch={handleSearch}
        setSearchText={setSearchText}
        searchText={searchText}
        disabled={isLoading}
      />
      <DataGrid
        autoHeight
        loading={isLoading}
        columns={[
          {
            field: "Waiver ID",
            hideable: false,
            flex: 1,
            valueGetter(params) {
              return params.row._id;
            },
            renderCell(params) {
              if (!params.row._source.authority) return null;
              return (
                <Link
                  className="cursor-pointer text-blue-600"
                  to={`/detail/${params.row._source.authority.toLowerCase()}?id=${encodeURIComponent(
                    params.row._id
                  )}`}
                >
                  {params.row._id}
                </Link>
              );
            },
          },
          {
            field: "State",
            flex: 1,
            valueGetter(params) {
              return params.row._source.state;
            },
          },
          {
            field: "Plan Type",
            flex: 1,
            valueGetter(params) {
              return removeUnderscoresAndCapitalize(
                params.row._source.planType
              );
            },
          },
          {
            field: "Status",
            flex: 1,
            valueGetter(params) {
              return getStatus(params.row._source.status, user?.isCms);
            },
          },
          {
            field: "Submission Date",
            flex: 1,
            valueGetter(params) {
              if (!params.row._source.submissionDate) return null;
              return format(params.row._source.submissionDate, "MM/dd/yyyy");
            },
          },
        ]}
        rows={searchData?.hits || []}
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
    </>
  );
};
