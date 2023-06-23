import { useGetSeatool } from "../../api/useGetSeatool";
import { formatDistance } from "date-fns";
import * as UI from "@enterprise-cmcs/macpro-ux-lib";
import { LoadingSpinner } from "../../components";
import { ChangeEvent, useState } from "react";

export const Row = ({ record }: { record: any }) => (
  <tr key={record.ID}>
    <UI.TH rowHeader>{record.ID}</UI.TH>
    <UI.TD>
      {formatDistance(new Date(record.SubmissionDate), new Date())} ago
    </UI.TD>
    <UI.TD>{record.PlanType}</UI.TD>
    <UI.TD>{record.StateAbbreviation}</UI.TD>
  </tr>
);

export const Dashboard = () => {
  const [selectedState, setSelectedState] = useState("CO");
  const { isLoading, isError, data } = useGetSeatool(selectedState);

  const handleStateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(event.target.value);
  };

  if (isLoading) return <LoadingSpinner />;

  if (isError)
    return (
      <UI.Alert
        alertBody={"An Error Occured. Please try again later."}
        alertHeading="Error"
        variation="error"
      />
    );

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
      <hr />
      <UI.Table borderless id="om-issues-table">
        <thead>
          <tr>
            <UI.TH>ID</UI.TH>
            <UI.TH>Submitted</UI.TH>
            <UI.TH>Type</UI.TH>
            <UI.TH>State</UI.TH>
          </tr>
        </thead>
        <tbody>
          {data.map((record: any) => {
            return <Row record={record} key={record.ID} />;
          })}
        </tbody>
      </UI.Table>
    </>
  );
};
