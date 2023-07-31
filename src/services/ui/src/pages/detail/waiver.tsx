import { SearchData } from "@/api";
import { DetailWrapper } from "./wrapper";

const Waiver = ({ data }: { data?: SearchData }) => {
  return (
    <div className="max-w-screen-lg mx-auto px-4 lg:px-8">
      <br />
      <p>Lets put stuff here</p>
      {JSON.stringify(data)}
    </div>
  );
};

export const WaiverPage = () => (
  <DetailWrapper>
    <Waiver />
  </DetailWrapper>
);
