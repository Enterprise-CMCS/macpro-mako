import { removeUnderscoresAndCapitalize } from "@/utils";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export const DetailNav = ({ id, type }: { id: string; type?: string }) => {
  const navigate = useNavigate();
  const planType = removeUnderscoresAndCapitalize(type);
  return (
    <div className="tw-bg-sky-100">
      <div className="tw-max-w-screen-xl tw-m-auto lg:tw-px-8">
        <div className="tw-flex tw-items-center">
          <div className="tw-flex tw-align-middle tw-py-4">
            <button className="tw-text-sky-800" onClick={() => navigate(-1)}>
              <ChevronLeftIcon className="tw-w-6 tw-h-6" />
            </button>
            <h1 className="tw-text-xl tw-font-medium tw-pl-4">
              {planType} Submission Details - {id}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};
