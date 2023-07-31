import { SearchData, useSearch } from "@/api";
import { ErrorAlert, SearchForm } from "@/components";
import { removeUnderscoresAndCapitalize } from "@/utils";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export const SpasList = ({ selectedState }: { selectedState: string }) => {
  const [rowSelectionModel, setRowSelectionModel] = useState<string>();
  const [searchText, setSearchText] = useState<string>("");
  const [searchData, setSearchData] = useState<SearchData[] | null>(null);
  const { mutateAsync, isLoading, error } = useSearch();

  useEffect(() => {
    handleSearch(searchText);
  }, [selectedState]);

  const handleSearch = async (searchText: string) => {
    try {
      const data = await mutateAsync({
        selectedState,
        searchString: searchText,
        programType: "CHIP OR MEDICAID",
      });

      setSearchData(data.hits);
    } catch (error) {
      console.error("Error occurred during search:", error);
    }
  };

  return error ? (
    <ErrorAlert error={error} />
  ) : (
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
            field: "Spa ID",
            hideable: false,
            flex: 1,
            valueGetter(params) {
              return params.row._id;
            },
            renderCell(params) {
              return (
                <Link
                  className="cursor-pointer text-blue-600"
                  to={`/record?region=${encodeURIComponent(
                    params.row._source.state
                  )}&id=${encodeURIComponent(params.row._id)}`}
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
              return params.row._source.status;
            },
          },
          {
            field: "Submission Date",
            flex: 1,
            valueGetter(params) {
              return format(params.row._source.submission_date, "MM/dd/yyyy");
            },
          },
          {
            field: "Program Type",
            flex: 1,
            valueGetter(params) {
              return params.row._source.programType;
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
    </>
  );
};
