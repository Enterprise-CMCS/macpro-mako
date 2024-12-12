import { useState } from "react";
import XIcon from "@/assets/X_dismiss_icon.svg";
import InfoIcon from "@/assets/info_circle_icon.svg";

const MMDLAlertBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("mmdlAlertDismissed", "true");
  };

  const goToFAQs = () => {
    window.location.href = "/faq#mmdl-section"; // Adjust the URL fragment to match the MMDL section
  };

  if (!isVisible) return null;

  return (
    <div className="bg-[#E1F3F8] w-full flex flex-col md:flex-row relative box-border h-auto md:h-[180px] lg:h-[98px] p-4 md:p-3 gap-4">
      <div className="bg-[#00A6D2] w-[8px] h-full absolute left-0 top-0"></div>
      <div className="flex items-center flex-grow mt-2">
        <img
          src={InfoIcon}
          alt="Info Icon"
          className="object-contain w-[32px] h-[32px] p-[2.67px] mx-4 mb-14"
        />
        <div className="flex flex-col flex-grow">
          <h3 className="font-bold text-black text-[18px] break-words pr-4">
            MMDL SPA forms available in OneMAC
          </h3>
          <p className="text-black leading-normal text-[16px] pr-4 break-words mb-2">
            Medicaid Alternative Benefit Plan, Premium and Cost Sharing, and CHIP Eligibility SPA templates and implementation guides are now available in OneMAC. New submissions for these SPA types are submitted through the OneMAC system effective [add date].
          </p>
        </div>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={goToFAQs}
          className="border-2 border-black rounded h-[38px] w-[116px] whitespace-nowrap top-2 left-[1108px] font-open-sans text-[16px] font-bold text-center decoration-transparent [text-decoration-skip-ink:none]"
        >
          Go to FAQs
        </button>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="rounded-full w-[24px] h-[24px] left-[1108px] flex justify-center"
        >
          <img
            src={XIcon}
            alt="Dismiss Icon"
            className="object-contain w-full h-full"
          />
        </button>
      </div>
    </div>
  );
};

export default MMDLAlertBanner;
