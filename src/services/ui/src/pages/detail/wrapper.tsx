import { useGetItem } from "@/api"; // Assuming useGetItem returns RecordData
import { LoadingSpinner } from "@/components";
import { useQuery } from "@/hooks";
import React from "react";
import { DetailNav } from "./detailNav";
import { OsHit, OsMainSourceItem } from "shared-types";

interface DetailWrapperProps {
  children: React.ReactNode;
}

interface ChildComponentProps {
  data: OsHit<OsMainSourceItem>;
  id: string;
}

export const DetailWrapper: React.FC<DetailWrapperProps> = ({ children }) => {
  const query = useQuery();
  const id = query.get("id") as string;
  const { data, isLoading, error } = useGetItem(id);

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <p>Error</p>;
  }

  return (
    <>
      <DetailNav id={id} type={data?._source.planType} />
      <div className="max-w-screen-lg mx-auto py-8 px-4 lg:px-8">
        {React.Children.map(children, (child) => {
          if (React.isValidElement<ChildComponentProps>(child)) {
            return React.cloneElement(child, { data: data, id });
          }
          return child;
        })}
      </div>
    </>
  );
};
