import * as C from "@/components";
import OneMacLogo from "@/assets/onemac_logo.svg";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import { QueryClient } from "@tanstack/react-query";
import { getUser } from "@/api/useGetUser";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/Button";
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
  const navigation = useNavigate();

  return (
    <>
      <div className="w-full bg-accent p-2 md:p-4">
        <div className="max-w-screen-xl flex flex-col sm:flex-row sm:items-center gap-4 mx-auto p-4 lg:px-8">
          <img src={OneMacLogo} alt="One Mac Logo" className="p-4" />
          <p className="text-center text-white/90 font-light text-xl font-sans">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Tenetur,
            voluptatem amet! Nihil numquam adipisci tempora explicabo.
          </p>
        </div>
      </div>
      {/* End Hero Section */}
      {/* Two Column Main Layout */}
      <main className="max-w-screen-xl mx-auto p-4 lg:px-8">
        <div className="flex flex-col justify-center gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">State Users</h3>
            <div className="flex flex-col md:flex-row gap-12">
              <C.HowItWorks>
                <C.Step
                  icon={<AcademicCapIcon className="min-w-[32px] w-8 h-8" />}
                  title="Possimus a, odio."
                  content="Lorem ipsum dolor sit amet."
                />
                <C.Step
                  icon={<AcademicCapIcon className="min-w-[32px] w-8 h-8" />}
                  title="Possimus a, odio."
                  content="Lorem ipsum dolor sit amet."
                />
                <C.Step
                  icon={<AcademicCapIcon className="min-w-[32px] w-8 h-8" />}
                  title="Possimus a, odio."
                  content="Lorem ipsum dolor sit amet."
                />
              </C.HowItWorks>
              <div className="flex-grow">
                <h4 className="font-bold text-xl mb-4">Lorem, ipsum.</h4>
                <ul className="flex flex-col gap-4">
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
            <h3 className="text-2xl font-bold mb-4">CMS Users</h3>
            <div className="flex flex-col md:flex-row gap-8">
              <C.HowItWorks>
                <C.Step
                  icon={<AcademicCapIcon className="min-w-[32px] w-8 h-8" />}
                  title="Possimus a, odio."
                  content="Lorem ipsum dolor sit amet."
                />
                <C.Step
                  icon={<AcademicCapIcon className="min-w-[32px] w-8 h-8" />}
                  title="Possimus a, odio."
                  content="Lorem ipsum dolor sit amet."
                />
                <C.Step
                  icon={<AcademicCapIcon className="min-w-[32px] w-8 h-8" />}
                  title="Possimus a, odio."
                  content="Lorem ipsum dolor sit amet."
                />
              </C.HowItWorks>
              <div>
                <h4 className="font-bold text-xl mb-4">Lorem, ipsum.</h4>
                <ul className="flex flex-col gap-4">
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
      <div className="bg-[#E1F3F8]">
        <section className="  home-footer-container ">
          <div className="home-footer-angle-box  border-t-120 border-r-[100vw] border-transparent bottom-0 left-0 mb-20 h-117 border-solid border-t-24 border-r-screen"></div>
          <div className="home-footer-faq-callout flex justify-around items-center text-xl py-10 px-10 py-4 max-w-screen-xl mx-auto ">
            <div>Do you have questions or need support?</div>
            <div className="ml-auto">
              <Button
                variant="default"
                onClick={() => {
                  navigation("/faq");
                }}
              >
                View FAQ
              </Button>
              {/* <Link to="/faq" className="footerViewFaqButton bg-blue-700 text-white text-base font-bold py-2 px-3">View FAQ</Link> */}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
