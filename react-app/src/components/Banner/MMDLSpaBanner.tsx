import { Cross2Icon } from "@radix-ui/react-icons";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { useGetSystemNotifs } from "@/api";
import { FAQ_TAB } from "@/router";
import { Link } from "react-router";
const MMDLAlertBanner = () => {
  const { clearNotif, notifications } = useGetSystemNotifs();

  if (!notifications.length) return null;

  return (
    <section
      className="bg-[#E1F3F8] grid md:grid-cols-[min-content_auto_min-content] md:grid-rows-[auto_auto] grid-cols-[auto_auto] gap-4 md:gap-x-4 border-l-[8px] border-[#00A6D2] p-3"
      aria-label="mmdl-alert-banner"
    >
      <InfoCircledIcon className="w-10 h-10" aria-hidden="true" />
      <div className="flex gap-x-4 flex-grow">
        <div className="flex flex-col flex-grow">
          <h3 className="font-bold text-black text-lg break-words">{notifications[0].header}</h3>
          <p className="text-black leading-normal break-words">{notifications[0].body}</p>
        </div>
      </div>
      <div className="flex space-x-4 col-start-2 md:col-start-auto">
        {notifications[0].buttonText && (
          <Link
            to={notifications[0].buttonLink}
            target={FAQ_TAB}
            rel="noopener noreferrer"
            className="border-2 border-black rounded h-[38px] px-4 text font-bold text-center whitespace-nowrap pt-1"
          >
            {notifications[0].buttonText}
          </Link>
        )}
        <button
          onClick={() => clearNotif(notifications[0].notifId)}
          aria-label="Dismiss"
          className="rounded-full w-6 h-6"
        >
          <Cross2Icon className="w-full h-full" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};

export default MMDLAlertBanner;
