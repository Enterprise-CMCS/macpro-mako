import { useState } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { InfoCircledIcon } from "@radix-ui/react-icons";
const MMDLAlertBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const handleDismiss = () => {
    setIsVisible(false);
  };
  if (!isVisible) return null;
  return (
    <div className="bg-[#E1F3F8] grid md:grid-cols-[min-content_auto_min-content] md:grid-rows-[auto_auto] grid-cols-[auto_auto] gap-4 md:gap-x-4 border-l-[8px] border-[#00A6D2] p-3">
      <InfoCircledIcon className="w-10 h-10" aria-hidden="true" />
      <div className="flex gap-x-4 flex-grow">
        <div className="flex flex-col flex-grow">
          <h3 className="font-bold text-black text-lg break-words">
            MMDL SPA forms available in OneMAC
          </h3>
          <p className="text-black leading-normal break-words">
            Medicaid Alternative Benefit Plan, Premium and Cost Sharing, and CHIP Eligibility SPA
            templates and implementation guides are now available in OneMAC. New submissions for
            these SPA types are submitted through the OneMAC system effective [add date].
          </p>
        </div>
      </div>
      <div className="flex space-x-4 col-start-2 md:col-start-auto">
        <a
          href="/faq#mmdl-section"
          target="_blank"
          rel="noopener noreferrer"
          className="border-2 border-black rounded h-[38px] px-4 text font-bold text-center whitespace-nowrap"
        >
          Go to FAQs
        </a>
        <button onClick={handleDismiss} aria-label="Dismiss" className="rounded-full w-6 h-6">
          <Cross2Icon className="w-full h-full" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
export default MMDLAlertBanner;
