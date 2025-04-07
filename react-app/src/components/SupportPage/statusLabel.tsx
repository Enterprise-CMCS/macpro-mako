import { cn } from "@/utils";
interface StatusLabelProps {
  type: "New" | "Updated";
}

const StatusLabel = ({ type }: StatusLabelProps) => {
  const statusColor = {
    New: "bg-blue-700",
    Updated: "bg-green-700",
  };
  return (
    <div className={cn("px-2 mr-2 font-light text-white rounded-[2px]", statusColor[type])}>
      {type}
    </div>
  );
};

export default StatusLabel;
