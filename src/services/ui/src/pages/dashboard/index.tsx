import { useGetSeatool } from "../../api/useGetSeatool";
import { formatDistance } from "date-fns";
import * as UI from "@enterprise-cmcs/macpro-ux-lib";
import { LoadingSpinner } from "../../components";

export const Row = ({ record }: { record: any }) => (
  <tr key={record.id}>
    <UI.TH rowHeader>{record.id}</UI.TH>
    <UI.TD>
      {formatDistance(new Date(record.STATE_PLAN.CHANGED_DATE), new Date())} ago
    </UI.TD>
    <UI.TD>{record.STATE_PLAN.SUMMARY_MEMO}</UI.TD>
  </tr>
);

export const Dashboard = () => {
  const { isLoading, isError, data } = useGetSeatool();

  console.log({ data });

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
      </div>
      <hr />
      <UI.Table borderless id="om-issues-table">
        <thead>
          <tr>
            <UI.TH>Id</UI.TH>
            <UI.TH>Last Changed</UI.TH>
            <UI.TH>Memo</UI.TH>
          </tr>
        </thead>
        <tbody>
          {data.map((record: any) => {
            return <Row record={record} key={record.id} />;
          })}
        </tbody>
      </UI.Table>
    </>
  );
};
