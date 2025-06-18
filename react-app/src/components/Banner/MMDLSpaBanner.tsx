import { Cross2Icon, InfoCircledIcon } from "@radix-ui/react-icons";
import { Link } from "react-router";

import { useGetSystemNotifs } from "@/api";
import { FAQ_TAB } from "@/consts";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

const MMDLAlertBanner = () => {
  const { clearNotif, notifications } = useGetSystemNotifs();
  const isUpgradeEnabled = useFeatureFlag("UPGRADE_MMDL_BANNER");

  if (!notifications.length) return null;

  const mmdlBanner = notifications.find((n) => n.header?.toLowerCase().includes("mmdl spa"));
  const enhancedBanner = notifications.find((n) =>
    n.header?.toLowerCase().includes("enhanced experience"),
  );

  const selectedBanner = isUpgradeEnabled ? mmdlBanner : enhancedBanner;
  if (!selectedBanner) return null;

  const { header, body, buttonText, buttonLink, disabled, notifId } = selectedBanner;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (disabled) e.preventDefault();
  };

  if (isUpgradeEnabled) {
    // Show MMDL Banner
    return (
      <section
        className="bg-[#E1F3F8] grid md:grid-cols-[min-content_auto_min-content] md:grid-rows-[auto_auto] grid-cols-[auto_auto] gap-4 md:gap-x-4 border-l-[8px] border-[#00A6D2] p-3"
        aria-label="mmdl-alert-banner"
      >
        <InfoCircledIcon className="w-10 h-10" aria-hidden="true" />
        <div className="flex gap-x-4 flex-grow">
          <div className="flex flex-col flex-grow">
            <h3 className="font-bold text-black text-lg break-words">{header}</h3>
            <p className="text-black leading-normal break-words">{body}</p>
          </div>
        </div>
        <div className="flex space-x-4 col-start-2 md:col-start-auto">
          {buttonText && (
            <Link
              to={buttonLink}
              onClick={handleClick}
              target={FAQ_TAB}
              rel="noopener noreferrer"
              className="border-2 border-black rounded h-[38px] px-4 text font-bold text-center whitespace-nowrap pt-1"
            >
              {buttonText}
            </Link>
          )}
          <button
            onClick={() => clearNotif(notifId)}
            aria-label="Dismiss"
            className="rounded-full w-6 h-6"
          >
            <Cross2Icon className="w-full h-full" aria-hidden="true" />
          </button>
        </div>
      </section>
    );
  }

  // Show Enhanced Experience Banner
  return (
    <section
      className="bg-[#02BFE7] grid md:grid-cols-[min-content_auto_min-content] md:grid-rows-[auto_auto] grid-cols-[auto_auto] gap-4 md:gap-x-4 p-3"
      aria-label="mmdl-alert-banner"
    >
      <InfoCircledIcon className="w-10 h-10 text-black" aria-hidden="true" />
      <div className="flex gap-x-4 flex-grow col-start-2 col-span-2 md:col-span-1">
        <div className="flex flex-col flex-grow">
          <h3 className="font-bold text-black text-lg break-words">{header}</h3>
          <p className="text-black leading-normal break-words">{body}</p>
        </div>
      </div>
      <div className="flex space-x-4 col-start-3 row-start-2 md:row-start-1">
        {buttonText && (
          <Link
            to={buttonLink}
            onClick={handleClick}
            target={FAQ_TAB}
            rel="noopener noreferrer"
            className="border-2 border-black rounded h-[38px] px-4 text font-bold text-center whitespace-nowrap pt-1 text-black"
          >
            {buttonText}
          </Link>
        )}
      </div>
      <div className="flex space-x-4 col-start-4 md:row-start-1">
        <button
          onClick={() => clearNotif(notifId)}
          aria-label="Dismiss"
          className="rounded-full w-6 h-6"
        >
          <Cross2Icon className="w-full h-full text-black" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};

export default MMDLAlertBanner;
