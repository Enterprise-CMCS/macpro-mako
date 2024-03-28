import { DetailsSection } from "@/components";
import {
  approvedAndAEffectiveDetails,
  descriptionDetails,
  recordDetails,
  submissionDetails,
} from "./hooks";

import { FC } from "react";

import { DetailSectionItem } from "./hooks";
import { useGetUser } from "@/api/useGetUser";
import { AppK } from "./appk";
import { cn } from "@/utils";
import { usePackageDetailsCache } from "..";

export const DetailItemsGrid: FC<{
  displayItems: DetailSectionItem[];
  fullWidth?: boolean;
  containerStyle?: string;
}> = (props) => {
  const { data: user } = useGetUser();
  return (
    <div
      className={cn(
        `${props.fullWidth ? "max-w-xl" : "grid grid-cols-2 gap-6"}`,
        props.containerStyle,
      )}
    >
      {props.displayItems.map(({ label, value, canView }) => {
        return !canView(user) ? null : (
          <div key={label}>
            <h3 style={{ fontWeight: 700 }}>{label}</h3>
            <div style={{ fontWeight: 400 }} className="py-2">
              {value}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const PackageDetails: FC<{
  title: string;
}> = (props) => {
  const { data } = usePackageDetailsCache();
  // const title = props.title || `${data.authority} Package Details`;
  return (
    <DetailsSection id="package_detailss" title={props.title}>
      <div className="flex-col gap-4 max-w-2xl">
        <DetailItemsGrid displayItems={recordDetails(data)} />
        <DetailItemsGrid
          displayItems={approvedAndAEffectiveDetails(data)}
          containerStyle="py-4"
        />
        <DetailItemsGrid displayItems={descriptionDetails(data)} fullWidth />
        <hr className="my-4" />
        <DetailItemsGrid displayItems={submissionDetails(data)} />
        <AppK />
      </div>
    </DetailsSection>
  );
};
