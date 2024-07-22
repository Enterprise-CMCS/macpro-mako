import { DetailsSection } from "@/components";
import {
  approvedAndAEffectiveDetails,
  descriptionDetails,
  recordDetails,
  submissionDetails,
} from "./hooks";

import { FC, useMemo } from "react";

import { DetailSectionItem } from "./hooks";
import { useGetUser } from "@/api/useGetUser";
import { AppK } from "./appk";
import { cn } from "@/utils";
import { usePackageDetailsCache } from "..";
import { Authority } from "shared-types";
import { ItemResult } from "shared-types/opensearch/main";

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

type PackageDetailsProps = {
  itemResult: ItemResult;
};

export const PackageDetails = ({ itemResult }: PackageDetailsProps) => {
  const { data } = usePackageDetailsCache();

  const title = useMemo(() => {
    const { _source: source } = itemResult;

    switch (source.authority) {
      case Authority["1915b"]:
      case Authority["1915c"]:
      case undefined: // Some TEs have no authority
        if (source.appkParent) return "Appendix K Amendment Package Details";
        if (source.actionType == "Extend")
          return "Temporary Extension Request Details";
    }

    return `${source.authority} Package Details`;
  }, [itemResult]);

  return (
    <DetailsSection id="package_details" title={title}>
      <div className="flex-col gap-4 max-w-2xl">
        <DetailItemsGrid
          displayItems={[
            ...recordDetails(data),
            ...approvedAndAEffectiveDetails(data),
            ...descriptionDetails(data),
          ]}
          containerStyle="py-4"
        />
        <hr className="my-4" />
        <DetailItemsGrid displayItems={submissionDetails(data)} />
        <AppK />
      </div>
    </DetailsSection>
  );
};
