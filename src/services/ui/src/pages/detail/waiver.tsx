import { SearchData } from "@/api";
import { DetailWrapper } from "./wrapper";

const Waiver = ({ data }: { data?: SearchData }) => {
  return <>{JSON.stringify(data)}</>;
};

export const WaiverPage = () => (
  <DetailWrapper>
    <Waiver />
  </DetailWrapper>
);
