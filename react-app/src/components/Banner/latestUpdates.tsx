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

  const latestUpdates = notifications.filter((notif) => notif.header === "Latest Updates");

  const updateMeta: Record<string, { title: string; date: string }> = {
    "9e38a211-5fd5-44ff-96cd-6d0a22a73a96": {
      date: "11-12-24",
      title: "MMDL SPA forms available in OneMAC",
    },
    "9e38a211-5fd5-44ff-96cd-6d0a22a73a97": {
      date: "11-10-24",
      title: "Update 2",
    },
    "9e38a211-5fd5-44ff-96cd-6d0a22a73a98": {
      date: "11-05-24",
      title: "Update 3",
    },
  };

  const visibleUpdates = showMore ? latestUpdates : latestUpdates.slice(0, 1);

  return (
    <div className={cn("m-auto w-full max-w-screen-xl min-h-[228px]", className)}>
      <div className="border-2 rounded-b-sm p-4 md:p-6 rounded-[3px] border-[#DFE1E2] bg-[var(--Background-Base-base-lightest,rgba(240,240,240,1))] overflow-hidden">
        <h2 className="text-2xl font-bold font-serif pb-2">Latest Updates</h2>
        <ul className="list-none pl-1">
          {visibleUpdates.map((notif) => {
            const meta = updateMeta[notif.notifId] || { date: "", title: "" };
            return (
              <li
                key={notif.notifId}
                className="pb-8 relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-sm before:top-1.5 before:leading-none text-[18px]"
              >
                <span className="font-semibold text-[#0071bc]">
                  {meta.date} {meta.title}:
                </span>
                {notif.buttonLink && (
                  <button
                    className="text-[#0071bc] underline ml-1"
                    onClick={() => (window.location.href = notif.buttonLink)}
                  >
                    →
                  </button>
                )}{" "}
                {notif.body}
              </li>
            );
          })}
        </ul>

        {latestUpdates.length > 1 && (
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex items-center justify-start gap-2 rounded-md bg-transparent mt-2 cursor-pointer"
          >
            <span className="pl-5 pt-[5px] pb-[5px] font-bold text-[#0071bc] leading-[22px] text-center">
              {showMore ? "Hide additional updates" : "Show more updates"}
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
        )}
      </div>
    </div>
  );
};
