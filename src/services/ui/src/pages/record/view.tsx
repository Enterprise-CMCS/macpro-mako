import { useGetRecord } from "@/api";
import { useQuery } from "../../hooks";
import { LoadingSpinner } from "@/components";

export const ViewRecord = () => {
  const query = useQuery();
  const id = query.get("id") as string;
  const region = query.get("region") as string;
  const { data, isLoading, error } = useGetRecord(id, region);

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <p>error</p>;
  }
  return (
    <div className="max-w-screen-lg mx-auto px-4 lg:px-8">
      <br />
      <h2>Region: {region}</h2>
      <h2>ID: {id}</h2>
      {JSON.stringify(data)}
    </div>
  );
};
