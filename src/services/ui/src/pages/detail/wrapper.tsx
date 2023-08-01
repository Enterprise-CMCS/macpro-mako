import { SearchData, useGetItem } from "@/api"; // Assuming useGetItem returns RecordData
import { LoadingSpinner } from "@/components";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

import { useQuery } from "@/hooks";
import React from "react";
import { useNavigate } from "react-router-dom";

interface DetailWrapperProps {
  children: React.ReactNode;
}

interface ChildComponentProps {
  data: SearchData;
  id: string;
}

export const DetailWrapper: React.FC<DetailWrapperProps> = ({ children }) => {
  const navigate = useNavigate();
  const query = useQuery();
  const id = query.get("id") as string;
  const { data, isLoading, error } = useGetItem(id);

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <p>Error</p>;
  }

  // Pass the fetched data down to the children components
  return (
    <>
      <div className="bg-sky-100">
        <div className="max-w-screen-lg m-auto lg:px-8">
          <div className="flex items-center">
            <div className="flex align-middle py-4">
              <button className="text-sky-800" onClick={() => navigate(-1)}>
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-medium pl-4">
                CHIP SPA Submission Details - {id}
              </h1>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-screen-lg mx-auto py-8 px-4 lg:px-8">
        {React.Children.map(children, (child) => {
          if (React.isValidElement<ChildComponentProps>(child)) {
            return React.cloneElement(child, { data: data.hits[0], id });
          }
          return child;
        })}
      </div>
    </>
  );
};
