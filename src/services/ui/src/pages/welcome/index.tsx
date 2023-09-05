import * as C from "@/components";
import OneMacLogo from "@/assets/onemac_logo.svg";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import { QueryClient } from "@tanstack/react-query";
import { getUser } from "@/api/useGetUser";

export const loader = (queryClient: QueryClient) => {
  return async () => {
    if (!queryClient.getQueryData(["user"])) {
      return await queryClient.fetchQuery({
        queryKey: ["user"],
        queryFn: () => getUser(),
      });
    }
    return queryClient.getQueryData(["user"]);
  };
};

export const Welcome = () => {
  return (
    <>
      {/*  Hero Section */}
      <div className="tw-w-full tw-bg-accent tw-p-2 md:tw-p-4">
        <div className="tw-max-w-screen-xl tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center tw-gap-4 tw-mx-auto tw-p-4 lg:tw-px-8">
          <img src={OneMacLogo} alt="One Mac Logo" className="tw-p-4" />
          <p className="tw-text-center tw-text-white/90 tw-font-light tw-text-xl tw-font-sans">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Tenetur,
            voluptatem amet! Nihil numquam adipisci tempora explicabo.
          </p>
        </div>
      </div>
      {/* End Hero Section */}
      {/* Two Column Main Layout */}
      <main className="tw-max-w-screen-xl tw-mx-auto tw-p-4 lg:tw-px-8">
        <div className="tw-flex tw-flex-col tw-justify-center tw-gap-8">
          <div>
            <h3 className="tw-text-2xl tw-font-bold tw-mb-4">State Users</h3>
            <div className="tw-flex tw-flex-col md:tw-flex-row tw-gap-12">
              <C.HowItWorks>
                <C.Step
                  icon={
                    <AcademicCapIcon className="min-w-[32px] tw-w-8 tw-h-8" />
                  }
                  title="Possimus a, odio."
                  content="Lorem ipsum dolor sit amet."
                />
                <C.Step
                  icon={
                    <AcademicCapIcon className="min-w-[32px] tw-w-8 tw-h-8" />
                  }
                  title="Possimus a, odio."
                  content="Lorem ipsum dolor sit amet."
                />
                <C.Step
                  icon={
                    <AcademicCapIcon className="min-w-[32px] tw-w-8 tw-h-8" />
                  }
                  title="Possimus a, odio."
                  content="Lorem ipsum dolor sit amet."
                />
              </C.HowItWorks>
              <div className="tw-flex-grow">
                <h4 className="tw-font-bold tw-text-xl tw-mb-4">
                  Lorem, ipsum.
                </h4>
                <ul className="tw-flex tw-flex-col tw-gap-4">
                  <li>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Architecto facilis laboriosam placeat molestias animi
                      atque sint modi accusantium maiores. Aliquam sequi ad
                      nobis nesciunt dignissimos natus dolorum quo illum vel?
                    </p>
                  </li>
                  <li>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Architecto facilis laboriosam placeat molestias animi
                      atque sint modi accusantium maiores. Aliquam sequi ad
                      nobis nesciunt dignissimos natus dolorum quo illum vel?
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div>
            <h3 className="tw-text-2xl tw-font-bold tw-mb-4">CMS Users</h3>
            <div className="tw-flex tw-flex-col md:tw-flex-row tw-gap-8">
              <C.HowItWorks>
                <C.Step
                  icon={
                    <AcademicCapIcon className="min-w-[32px] tw-w-8 tw-h-8" />
                  }
                  title="Possimus a, odio."
                  content="Lorem ipsum dolor sit amet."
                />
                <C.Step
                  icon={
                    <AcademicCapIcon className="min-w-[32px] tw-w-8 tw-h-8" />
                  }
                  title="Possimus a, odio."
                  content="Lorem ipsum dolor sit amet."
                />
                <C.Step
                  icon={
                    <AcademicCapIcon className="min-w-[32px] tw-w-8 tw-h-8" />
                  }
                  title="Possimus a, odio."
                  content="Lorem ipsum dolor sit amet."
                />
              </C.HowItWorks>
              <div>
                <h4 className="tw-font-bold tw-text-xl tw-mb-4">
                  Lorem, ipsum.
                </h4>
                <ul className="tw-flex tw-flex-col tw-gap-4">
                  <li>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Architecto facilis laboriosam placeat molestias animi
                      atque sint modi accusantium maiores. Aliquam sequi ad
                      nobis nesciunt dignissimos natus dolorum quo illum vel?
                    </p>
                  </li>
                  <li>
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Architecto facilis laboriosam placeat molestias animi
                      atque sint modi accusantium maiores. Aliquam sequi ad
                      nobis nesciunt dignissimos natus dolorum quo illum vel?
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
