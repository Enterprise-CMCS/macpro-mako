import { FC, useState } from "react";

import { useGetSystemNotifs } from "@/api";
import { cn } from "@/utils";

interface LatestUpdatesProps {
  className?: string;
}

export const LatestUpdates: FC<LatestUpdatesProps> = ({ className }) => {
  const [showMore, setShowMore] = useState(false);
  const { notifications } = useGetSystemNotifs();

  if (!notifications.length) return null;

  const latestNotification = notifications.find((notif) => notif.header === "Latest Updates");

  if (!latestNotification) return null;

  const updatesArray: any[] = Array.isArray(latestNotification.body) ? latestNotification.body : [];

  return (
    <div className={cn("m-auto w-full max-w-screen-xl min-h-[228px]", className)}>
      <div className="border-2 rounded-b-sm p-4 md:p-6 rounded-[3px] border-[#DFE1E2] bg-[var(--Background-Base-base-lightest,rgba(240,240,240,1))] overflow-hidden">
        <h2 className="text-2xl font-bold font-serif pb-2">{latestNotification.header}</h2>
        <ul className="list-none pl-1">
          {updatesArray.length > 0 &&
            updatesArray.slice(0, showMore ? updatesArray.length : 1).map((update, index) => (
              <li
                key={index}
                className="pb-8 relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-sm before:top-1.5 before:leading-none"
              >
                {update.date}
                <span className="font-bold text-[#0071bc]"> {update.title}</span>{" "}
                {update.description}
              </li>
            ))}
        </ul>
        <button
          onClick={() => setShowMore(!showMore)}
          className="flex items-center justify-start gap-2 rounded-md bg-transparent mt-2 cursor-pointer"
        >
          <span className="pl-5 pt-[5px] pb-[5px] font-bold text-[#0071bc] leading-[22px] text-center">
            {showMore ? "Hide additional updates" : latestNotification.buttonText}
          </span>
          <svg
            className="w-[24px] h-[24px] text-[#0071bc]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={showMore ? "M20 12H4" : "M12 4v16m8-8H4"}
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
