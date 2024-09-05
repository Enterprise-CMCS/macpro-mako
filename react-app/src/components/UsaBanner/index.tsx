import { useState } from "react";
import { useLoaderData } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import config from "@/config";
import { LockIcon } from "../LockIcon";
import { GovernmentBuildingIcon } from "../GovernmentBuildingIcon";
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

type UsaBannerProps = {
  isUserMissingRole: boolean;
};

export const UsaBanner = ({ isUserMissingRole }: UsaBannerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { error } = useLoaderData() as { error: string };

  return (
    <div className="bg-[#f0f0f0]" role="banner">
      <div className="max-w-screen-xl px-4 py-1 lg:px-8 text-xs mx-auto gap-2 items-center hidden md:flex">
        <img
          className="w-4 h-[11px]"
          src={UsFlag}
          alt="A United States Flag icon"
        />
        <p>An official website of the United States government</p>
        <button className="flex" onClick={() => setIsOpen((value) => !value)}>
          <span className="underline text-[#005ea2]">
            Here&apos;s how you know
          </span>
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
        <img
          className="w-4 h-[11px]"
          src={UsFlag}
          alt="A United States Flag icon"
        />
        <div>
          <p>An official website of the United States government</p>
          <div className="flex">
            <span className="underline text-[#005ea2] block">
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
        <div className="w-full  px-4 py-1 lg:px-8 text-xs mx-auto flex gap-2 items-center justify-center bg-red-200 ">
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
        <div className="flex flex-col gap-3 px-3 mt-3 sm:flex-row max-w-screen-lg mx-auto pb-4">
          <div className="flex gap-2">
            <GovernmentBuildingIcon className="min-w-[40px] min-h-[40px] w-10" />
            <p className="text-sm max-w-md">
              <strong className="block">Official websites use .gov</strong>A
              <strong>.gov</strong> website belongs to an official government
              organization in the United States.
            </p>
          </div>
          <div className="flex gap-2">
            <LockIcon className="min-w-[40px] min-h-[40px] w-10" />
            <p className="text-sm max-w-md">
              <strong className="block">Secure .gov websites use HTTPS</strong>
              A lock (<MiniLock />) or <strong>https://</strong> means you've
              safely connected to the .gov website. Share sensitive information
              only on official, secure websites.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
