import * as C from "@/components";
import OneMacLogo from "@/assets/onemac_logo.svg";

export const Welcome = () => {
  return (
    <>
      {/*  Hero Section */}
      <div className="w-full bg-accent p-2 md:p-4">
        <div className="max-w-screen-lg flex flex-col sm:flex-row sm:items-center gap-4 mx-auto p-4 lg:px-8">
          <img src={OneMacLogo} alt="One Mac Logo" className="p-4" />
          <p className="text-center text-white/90 font-light text-xl font-sans">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Tenetur,
            voluptatem amet! Nihil numquam adipisci tempora explicabo.
          </p>
        </div>
      </div>
      {/* End Hero Section */}
      {/* Two Column Main Layout */}
      <main className="max-w-screen-lg mx-auto p-4 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">State Users</h3>
            <div className="flex flex-col md:flex-row gap-12">
              <C.HowItWorks />
              <div>
                <h4 className="font-bold text-xl mb-4">Lorem, ipsum.</h4>
                <ul className="flex flex-col gap-4">
                  <li>
                    <p className="max-w-sm">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Architecto facilis laboriosam placeat molestias animi
                      atque sint modi accusantium maiores. Aliquam sequi ad
                      nobis nesciunt dignissimos natus dolorum quo illum vel?
                    </p>
                  </li>
                  <li>
                    <p className="max-w-sm">
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
              <C.HowItWorks />
              <div>
                <h4 className="font-bold text-xl mb-4">Lorem, ipsum.</h4>
                <ul className="flex flex-col gap-4">
                  <li>
                    <p className="max-w-sm">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Architecto facilis laboriosam placeat molestias animi
                      atque sint modi accusantium maiores. Aliquam sequi ad
                      nobis nesciunt dignissimos natus dolorum quo illum vel?
                    </p>
                  </li>
                  <li>
                    <p className="max-w-sm">
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
