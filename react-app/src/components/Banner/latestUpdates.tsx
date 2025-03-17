import { FC, useState } from "react";
import { cn } from "@/utils";

interface LatestUpdatesProps {
  className?: string;
}

export const LatestUpdates: FC<LatestUpdatesProps> = ({ className }) => {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className={cn("m-auto w-full max-w-screen-xl min-h-[228px]", className)}>
      <div className="border-2 rounded-b-sm p-4 md:p-6rounded-[3px] border-[#DFE1E2] bg-[var(--Background-Base-base-lightest,rgba(240,240,240,1))] overflow-hidden">
        <h2 className="text-2xl font-bold font-serif pb-2">Latest Updates</h2>
        <ul className="list-none pl-1">
          <li className="pb-8 relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-sm before:top-1.5 before:leading-none">
            11-12-24
            <span className="font-bold text-[#0071bc]">
              {" "}
              MMDL SPA forms available in OneMAC:
            </span>{" "}
            Medicaid Alternative Benefit Plan, Premium and Cost Sharing, and CHIP Eligibility SPA
            templates and implementation guides are now available in OneMAC. New submissions for
            these SPA types are submitted through the OneMAC system effective [date].
          </li>
          {showMore && (
            <div className="transition-all duration-300 ease-in-out">
              <li className="pb-8 max-w-full relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-sm before:top-1.5 before:leading-none">
                11-10-24
                <span className="font-bold text-[#0071bc]"> Update 2:</span> Medicaid Alternative
                Benefit Plan, Premium and Cost Sharing, and CHIP Eligibility SPA templates and
                implementation guides are now available in OneMAC. New submissions for these SPA
                types are submitted through the OneMAC system effective [date].
              </li>
              <li className="pb-8 max-w-full relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-sm before:top-1.5 before:leading-none">
                11-05-24
                <span className="font-bold text-[#0071bc]"> Update 3:</span> Medicaid Alternative
                Benefit Plan, Premium and Cost Sharing, and CHIP Eligibility SPA templates and
                implementation guides are now available in OneMAC. New submissions for these SPA
                types are submitted through the OneMAC system effective [date].
              </li>
            </div>
          )}
        </ul>
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
              d={showMore ? "M20 12H4" : "M12 4v16m8-8H4"} // Toggle between plus and minus icons
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
