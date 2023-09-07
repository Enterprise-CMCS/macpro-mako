import { ChevronDown, ChevronUp } from "lucide-react";
import { LockIcon } from "../LockIcon";
import UsFlag from "@/assets/us_flag_small.png";

export const UsaBanner = () => {
  return (
    <div className="bg-[#f0f0f0]">
      <div className="max-w-screen-xl px-4 py-1 lg:px-8 text-xs mx-auto flex gap-2 items-center">
        <img
          className="w-4 h-[11px]"
          src={UsFlag}
          alt="A United States Flag icon"
        />
        <p>An official website of the United States government</p>
        <button>
          <span className="underline text-[#005ea2]">
            Here&apos;s how you know
          </span>
        </button>
        <button>
          <ChevronUp className="w-4 h-4 text-[#005ea2]" />
        </button>
      </div>
    </div>
  );
};
