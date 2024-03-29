import { PropsWithChildren } from "react";
import { opensearch } from "shared-types";
import { removeUnderscoresAndCapitalize } from "@/utils";

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

export const PackageInfo = ({ item }: { item: opensearch.main.ItemResult }) => (
  <section>
    <SectionTemplate label={"Package ID"} value={item._id} />
    <SectionTemplate
      label={"Authority"}
      value={
        item?._source?.authority
          ? removeUnderscoresAndCapitalize(item._source.authority as string)
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
