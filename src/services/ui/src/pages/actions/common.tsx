import { removeUnderscoresAndCapitalize } from "@/utils";
import { PropsWithChildren } from "react";
import { ItemResult } from "shared-types";

// Keeps aria stuff and classes condensed
const SectionTemplate = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="flex flex-col my-8">
    <label id="package-id-label">{label}</label>
    <span className="text-xl" aria-labelledby="package-id-label">
      {value}
    </span>
  </div>
);

export const PackageInfo = ({ item }: { item: ItemResult }) => (
  <section>
    <SectionTemplate label={"Package ID"} value={item._id} />
    <SectionTemplate
      label={"Type"}
      value={
        item?._source?.planType
          ? removeUnderscoresAndCapitalize(item._source.planType)
          : "No package type found"
      }
    />
  </section>
);

export const ActionFormIntro = ({
  title,
  children,
}: PropsWithChildren<{ title: string }>) => (
  <div className="max-w-2xl">
    <h1 className="text-2xl font-semibold mt-4 mb-2">{title}</h1>
    {children}
  </div>
);
