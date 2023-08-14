import { removeUnderscoresAndCapitalize } from "@/utils";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export const DetailNav = ({ id, type }: { id: string; type: string }) => {
  const navigate = useNavigate();
  const planType = removeUnderscoresAndCapitalize(type);
  return (
    <div className="bg-sky-100">
      <div className="max-w-screen-lg m-auto lg:px-8">
        <div className="flex items-center">
          <div className="flex align-middle py-4">
            <button className="text-sky-800" onClick={() => navigate(-1)}>
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-medium pl-4">
              {planType} Submission Details - {id}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};
