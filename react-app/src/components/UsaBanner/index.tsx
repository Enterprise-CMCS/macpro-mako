import { useState } from "react";
import { useLoaderData } from "react-router";
import { ChevronDown, ChevronUp } from "lucide-react";
import config from "@/config";
import { LockIcon } from "../LockIcon";
import UsFlag from "@/assets/us_flag_small.png";

const MiniLock = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="52"
      height="64"
      viewBox="0 0 52 64"
      className="inline w-[10px] h-[10px]"
      role="img"
      focusable="false"
    >
      <title id="banner-lock-title-default">Lock</title>
      <desc id="banner-lock-description-default">A locked padlock</desc>
      <path
        fill="#000000"
        fillRule="evenodd"
        d="M26 0c10.493 0 19 8.507 19 19v9h3a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V32a4 4 0 0 1 4-4h3v-9C7 8.507 15.507 0 26 0zm0 8c-5.979 0-10.843 4.77-10.996 10.712L15 19v9h22v-9c0-6.075-4.925-11-11-11z"
      ></path>
    </svg>
  );
};

const GovernmentBuildingIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      viewBox="0 0 64 64"
      className="min-w-[40px] min-h-[40px] w-10"
      data-testid="gov-build-icon"
    >
      <path
        fill="#2378C3"
        fillRule="evenodd"
        d="M32 0c17.673 0 32 14.327 32 32 0 17.673-14.327 32-32 32C14.327 64 0 49.673 0 32 0 14.327 14.327 0 32 0zm0 1.208C14.994 1.208 1.208 14.994 1.208 32S14.994 62.792 32 62.792 62.792 49.006 62.792 32 49.006 1.208 32 1.208zm10.59 38.858a.857.857 0 01.882.822v1.642H18.886v-1.642a.857.857 0 01.882-.822H42.59zM25.443 27.774v9.829h1.642v-9.83h3.273v9.83H32v-9.83h3.272v9.83h1.643v-9.83h3.272v9.83h.76a.857.857 0 01.882.821v.821h-21.3v-.809a.857.857 0 01.88-.82h.762v-9.842h3.272zm5.736-8.188l12.293 4.915v1.642h-1.63a.857.857 0 01-.882.822H21.41a.857.857 0 01-.882-.822h-1.642v-1.642l12.293-4.915z"
      ></path>
    </svg>
  );
};

type UsaBannerProps = {
  isUserMissingRole: boolean;
};

export const UsaBanner = ({ isUserMissingRole }: UsaBannerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { error } = useLoaderData() as { error: string };

  return (
    <div className="bg-[#f0f0f0]" role="banner">
      <div className="max-w-screen-xl px-4 py-1 lg:px-8 text-xs mx-auto gap-2 items-center hidden md:flex">
        <img className="w-4 h-[11px]" src={UsFlag} alt="A United States Flag icon" />
        <p data-testid="usa-statement-d">An official website of the United States government</p>
        <button
          data-testid="usa-expand-btn-d"
          className="flex"
          onClick={() => setIsOpen((value) => !value)}
        >
          <span className="underline text-[#005ea2]">Here's how you know</span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-[#005ea2]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#005ea2]" />
          )}
        </button>
      </div>

      <button
        className="w-full flex items-center text-[0.8rem] px-4 py-1 leading-4 gap-2 md:hidden"
        onClick={() => setIsOpen((value) => !value)}
      >
        <img className="w-4 h-[11px]" src={UsFlag} alt="A United States Flag icon" />
        <div>
          <p data-testid="usa-statement-m">An official website of the United States government</p>
          <div className="flex">
            <span data-testid="usa-expand-btn-m" className="underline text-[#005ea2] block">
              Here's how you know
            </span>
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-[#005ea2]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#005ea2]" />
            )}
          </div>
        </div>
      </button>

      {(isUserMissingRole || error?.length > 0) && (
        <div className="w-full  px-4 py-1 lg:px-8 text-xs mx-auto flex gap-2 items-center justify-center bg-red-200">
          <p className="text-center text-base">
            You do not have access to view the entire application.{" "}
            <a
              rel="noreferrer"
              href={config.idm.home_url}
              target="_blank"
              className="text-blue-600 inline  no-underline"
            >
              Please visit IDM
            </a>{" "}
            to request the appropriate user role(s).
          </p>
        </div>
      )}

      {isOpen && (
        <div className="flex flex-col justify-between px-4 lg:px-8 mt-3 sm:flex-row max-w-screen-xl mx-auto pb-4">
          <div className="flex gap-2">
            <GovernmentBuildingIcon />
            <p data-testid="official-usage" className="text-sm max-w-md">
              <strong className="block">Official websites use .gov</strong>A<strong>.gov</strong>{" "}
              website belongs to an official government organization in the United States.
            </p>
          </div>
          <div className="flex gap-2">
            <LockIcon className="min-w-[40px] min-h-[40px] w-10" />
            <p data-testid="secure-usage" className="text-sm max-w-md">
              <strong className="block">Secure .gov websites use HTTPS</strong>
              A lock (<MiniLock />) or <strong>https://</strong> means you've safely connected to
              the .gov website. Share sensitive information only on official, secure websites.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
