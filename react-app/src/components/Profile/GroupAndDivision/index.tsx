import { CardWithTopBorder } from "@/components/Cards";

type GroupAndDivisionProps = {
  division: string;
  group: string;
};

export const GroupAndDivision = ({ division, group }: GroupAndDivisionProps) => (
  <CardWithTopBorder className="my-0">
    <div className="p-8 flex gap-x-1 items-center">
      <h3 className="text-xl font-bold">Group:</h3>
      <p>{group}</p>
    </div>

    <div className="p-8 flex gap-x-1 items-center">
      <h3 className="text-xl font-bold">Division:</h3>
      <p>{division}</p>
    </div>
  </CardWithTopBorder>
);
