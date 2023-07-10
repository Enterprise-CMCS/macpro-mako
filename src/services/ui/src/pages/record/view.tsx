import { useQuery } from "../../hooks";

export const ViewRecord = () => {
  const query = useQuery();

  return (
    <>
      <br />
      <p>This is a route to view the details of record: </p>
      <br />
      <h2>Type: {query.get("type")}</h2>
      <h2>ID: {query.get("id")}</h2>
    </>
  );
};
