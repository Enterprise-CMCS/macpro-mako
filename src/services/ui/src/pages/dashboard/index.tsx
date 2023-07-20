import { useSearch, SearchData } from "../../api/useSearch";
import { formatDistance } from "date-fns";
import * as UI from "@enterprise-cmcs/macpro-ux-lib";
import { LoadingSpinner, ErrorAlert } from "../../components";
import { ChangeEvent, useState, useRef, useEffect } from "react";
import { SeatoolData } from "shared-types";
import { Link } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";
const defaultMaterialTheme = createTheme();
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

export function Row({ record }: { record: SeatoolData }) {
  let status = "Unknown"; // not sure what status to use or even what "record.SPW_STATUS[0].SPW_STATUS_DESC" is
  if (record.SPW_STATUS && record.SPW_STATUS[0]) {
    status = record.SPW_STATUS[0].SPW_STATUS_DESC;
  }

  return (
    <tr key={record.ID}>
      <UI.TH rowHeader>
        <Link
          className="cursor-pointer text-blue-600"
          to={`/record?type=${encodeURIComponent(
            record.PLAN_TYPE
          )}&id=${encodeURIComponent(record.ID)}`}
          target="_blank"
        >
          {record.ID}
        </Link>
      </UI.TH>
      <UI.TD>
        {formatDistance(new Date(record.SUBMISSION_DATE), new Date())} ago
      </UI.TD>
      <UI.TD>{record.PLAN_TYPE}</UI.TD>
      <UI.TD>{record.STATE_CODE}</UI.TD>
      <UI.TD>{status}</UI.TD>
      <UI.TD
        style={{
          maxWidth: "260px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {record.STATE_PLAN.SUMMARY_MEMO}
      </UI.TD>
    </tr>
  );
}

export const Dashboard = () => {
  const [selectedState, setSelectedState] = useState("VA");
  const [searchbox, setSearchbox] = useState("");
  const [rowSelectionModel, setRowSelectionModel] = useState("");
  const { isLoading, data, error } = useSearch({selectedState, searchbox}, {
    retry: false,
  });
  const tableRef = useRef();
  const handleStateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(event.target.value);
  };

  console.log(data);
  console.log(rowSelectionModel)
  if (isLoading) return <LoadingSpinner />;

  return (
    <>
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
      <div className="Search" data-testid="Search-Container">
          {renderSearch()}
        </div>
      <hr />
    </>
  );
console.log(data);
  function renderSearch() {
    return (
      <div
        style={{
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <UI.Search
          // onInput={(event: React.ChangeEvent<HTMLInputElement>) => {
          //   setSearchbox(event.target.value);
          // }}
          onSearch={(value: string) => {
            setSearchbox(value);
          }}
          placeholder="Enter text"
          variation="default"
        />
        <ThemeProvider theme={defaultMaterialTheme}>
        <DataGrid
            columns={[
              {
                field: "Transmittal ID Number (TIN)",
                hideable: false,
                flex: 1,
                valueGetter(params) {
                  return params.row._id;
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
                field: "Submission Date",
                flex: 1,
                valueGetter(params) {
                  return (new Date(params.row._source.seatool.SUBMISSION_DATE)).toISOString();
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
                field: "Status Memo",
                flex: 1,
                valueGetter(params) {
                  return params.row._source.seatool?.STATE_PLAN?.STATUS_MEMO;
                },
              },
            ]}
            rows={data?.hits as SearchData[]}
            getRowId={(row) => row._id}
            slots={{
              toolbar: GridToolbar,
            }}
            onRowSelectionModelChange={
              (newRowSelectionModel) => {
                setRowSelectionModel(newRowSelectionModel.toString());
            }}
            rowSelectionModel={rowSelectionModel}
          />
        </ThemeProvider>
      </div>
    );
  }
};