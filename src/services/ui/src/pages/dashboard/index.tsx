import { useSearch, SearchData } from "../../api/useSearch";
import { formatDistance } from "date-fns";
import * as UI from "@enterprise-cmcs/macpro-ux-lib";
import { LoadingSpinner, ErrorAlert } from "../../components";
import { ChangeEvent, useState, useRef } from "react";
import { SeatoolData } from "shared-types";
import { Link } from "react-router-dom";
import MaterialTable from "material-table";
import { ThemeProvider, createTheme } from "@mui/material";
const defaultMaterialTheme = createTheme();

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
  const { isLoading, data, error } = useSearch({selectedState, searchbox}, {
    retry: false,
  });
  const tableRef = useRef();
  const handleStateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(event.target.value);
  };

  console.log(data);

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
      {/* {error ? (
        <ErrorAlert error={error} />
      ) : (
        <UI.Table borderless id="om-seatool-table">
          <thead>
            <tr>
              <UI.TH>ID</UI.TH>
              <UI.TH>Submitted</UI.TH>
              <UI.TH>Type</UI.TH>
              <UI.TH>State</UI.TH>
              <UI.TH>Status</UI.TH>
              <UI.TH>Summary</UI.TH>
            </tr>
          </thead>
          <tbody>
            {data &&
              data.map((record) => {
                return <Row record={record} key={record.ID} />;
              })}
          </tbody>
        </UI.Table>
      )} */}
    </>
  );

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
          <MaterialTable
            tableRef={tableRef}
            options={{
              toolbar: false,
              paging: false,
            }}
            columns={[
              {
                title: "Transmittal ID Number (TIN)",
                field: "tin",
                render: (rowData) => {
                  // return rowData;
                  console.log(rowData._source);
                  console.log('rowData');
                  return rowData._id;
                },
              }
            ]}
            data={data?.hits as SearchData[]}
          />
        </ThemeProvider>
      </div>
    );
  }
};