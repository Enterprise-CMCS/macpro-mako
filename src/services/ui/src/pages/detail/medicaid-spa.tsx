import { SearchData } from "@/api";
import { DetailWrapper } from "./wrapper";

const MedicaidSpa = ({ data }: { data?: SearchData }) => {
  return <>{JSON.stringify(data)}</>;
};

export const MedicaidSpaPage = () => (
  <DetailWrapper>
    <MedicaidSpa />
  </DetailWrapper>
);
