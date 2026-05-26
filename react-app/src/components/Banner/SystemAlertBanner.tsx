import { Cross2Icon, InfoCircledIcon } from "@radix-ui/react-icons";
import type { MouseEvent } from "react";
import { Link } from "react-router";

import { useGetSystemNotifs } from "@/api";
import { FAQ_TAB } from "@/consts";

const SystemAlertBanner = () => {
  const { clearNotif, notifications } = useGetSystemNotifs();
  const selectedBanner = notifications[0];

  if (!selectedBanner) return null;

  const { header, body, buttonText, buttonLink, disabled, notifId } = selectedBanner;
  const buttonClassName =
    "border-2 border-black rounded h-[38px] px-4 text font-bold text-center whitespace-nowrap pt-1 text-black";
  const isPdfLink = buttonLink.toLowerCase().endsWith(".pdf");

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (disabled) e.preventDefault();
  };

  return (
    <section
      className="bg-[#E1F3F8] grid md:grid-cols-[min-content_auto_min-content] md:grid-rows-[auto_auto] grid-cols-[auto_auto] gap-4 md:gap-x-4 border-l-[8px] border-[#00A6D2] p-3"
      aria-label="system-alert-banner"
    >
      <InfoCircledIcon className="w-10 h-10 text-black" aria-hidden="true" />
      <div className="flex gap-x-4 flex-grow">
        <div className="flex flex-col flex-grow">
          <h3 className="font-bold text-black text-lg break-words">{header}</h3>
          <p className="text-black leading-normal break-words">{body}</p>
        </div>
      </div>
      <div className="flex space-x-4 col-start-2 md:col-start-auto">
        {buttonText && isPdfLink && (
          <a
            href={buttonLink}
            onClick={handleClick}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClassName}
          >
            {buttonText}
          </a>
        )}
        {buttonText && !isPdfLink && (
          <Link
            to={buttonLink}
            onClick={handleClick}
            target={FAQ_TAB}
            rel="noopener noreferrer"
            className={buttonClassName}
          >
            {buttonText}
          </Link>
        )}
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

export default SystemAlertBanner;
