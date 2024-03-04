import { DetailsSection } from "@/components";
import { spaDetails, submissionDetails } from "./hooks";
import { opensearch } from "shared-types";
import { FC } from "react";

import { DetailSectionItem } from "./hooks";
import { useGetUser } from "@/api/useGetUser";
import { AppK } from "./appk";

export const DetailItemsGrid: FC<{ displayItems: DetailSectionItem[] }> = (
  props
) => {
  const { data: user } = useGetUser();
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {props.displayItems.map(({ label, value, canView }) => {
          return !canView(user) ? null : (
            <div key={label}>
              <h3 className="text-sm">{label}</h3>
              {value}
            </div>
          );
        })}
      </div>
      <hr className="my-4" />
    </>
  );
};

export const PackageDetails: FC<opensearch.main.Document> = (props) => {
  return (
    <DetailsSection
      id="package-details"
      title={`${props.authority} Package Details`}
    >
      <DetailItemsGrid displayItems={spaDetails(props)} />
      <DetailItemsGrid displayItems={submissionDetails(props)} />
      <AppK {...props} />
    </DetailsSection>
  );
};
