import { useState } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { InfoCircledIcon } from "@radix-ui/react-icons";

const MMDLAlertBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("mmdlAlertDismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="bg-[#E1F3F8] w-full flex flex-col md:flex-row relative box-border h-auto md:h-[180px] lg:h-[98px] p-4 md:p-3 gap-4">
      <div className="bg-[#00A6D2] w-[8px] h-full absolute left-0 top-0"></div>
      <div className="flex items-center flex-grow mt-2">
        <InfoCircledIcon
          className="object-contain w-[38px] h-[38px]  mx-4 mb-14"
          aria-hidden="true"
        />
        <div className="flex flex-col flex-grow">
          <h3 className="font-bold text-black text-[18px] break-words pr-4">
            MMDL SPA forms available in OneMAC
          </h3>
          <p className="text-black leading-normal text-[16px] pr-4 break-words mb-2">
            Medicaid Alternative Benefit Plan, Premium and Cost Sharing, and CHIP Eligibility SPA
            templates and implementation guides are now available in OneMAC. New submissions for
            these SPA types are submitted through the OneMAC system effective [add date].
          </p>
        </div>
      </div>
      <div className="flex space-x-4">
        <a
          href="/faq#mmdl-section"
          target="_blank"
          rel="noopener noreferrer"
          className="border-2 border-black rounded h-[38px] px-4 text-[16px] font-open-sans font-bold text-center decoration-transparent [text-decoration-skip-ink:none] whitespace-nowrap flex items-center justify-center"
        >
          Go to FAQs
        </a>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="rounded-full w-[24px] h-[24px] flex justify-center items-center"
        >
          <Cross2Icon className="object-contain w-full h-full" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default MMDLAlertBanner;
