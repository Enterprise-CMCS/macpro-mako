import { AcademicCapIcon } from "@heroicons/react/24/outline";

type Steps = {
  icon: React.ReactNode;
};

// type Props = {};

export const HowItWorks = () => {
  return (
    <div className="py-8 px-6 border border-gray-300 rounded-md border-solid max-w-sm">
      <h4 className="text-bold text-xl">How it works</h4>
      <div className="flex gap-4 items-center mt-4">
        <AcademicCapIcon className="min-w-[32px] w-8 h-8" />
        <div className="">
          <p className="text-bold">Possimus a, odio.</p>
          <p className="">Lorem ipsum dolor sit amet.</p>
        </div>
      </div>
      <div className="flex gap-4 items-center mt-4">
        <AcademicCapIcon className="min-w-[32px] w-8 h-8" />
        <div className="">
          <p className="text-bold">Possimus a, odio.</p>
          <p className="">Lorem ipsum dolor sit amet.</p>
        </div>
      </div>
      <div className="flex gap-4 items-center mt-4">
        <AcademicCapIcon className="min-w-[32px] w-8 h-8" />
        <div className="">
          <p className="text-bold">Possimus a, odio.</p>
          <p className="">Lorem ipsum dolor sit amet.</p>
        </div>
      </div>
    </div>
  );
};
