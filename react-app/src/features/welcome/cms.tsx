import { useMemo } from "react";

import { LatestUpdates } from "@/components/Banner/latestUpdates";
import { Footer } from "@/components/Footer";
import { Welcome } from "@/features/welcome/default";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

export const CMSWelcome = () => {
  const cards = [
    {
      id: 1,
      title: "MACPro System",
      content: "Medicaid & CHIP Program System",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      buttonText: "Go to MACPro System",
      buttonLink: "https://macpro.cms.gov/suite",
    },
    {
      id: 2,
      title: "SEA Tool",
      content: "State Early Alert",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      buttonText: "Go to SEA Tool",
      buttonLink: "https://sea.cms.gov/",
    },
    {
      id: 3,
      title: "WMS",
      content: "Waiver Management System",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      buttonText: "Go to WMS",
      buttonLink: "https://wms-mmdl.cms.gov/WMS/faces/portal.jsp",
    },
    {
      id: 4,
      title: "eRegs",
      content: "Medicaid and CHIP eRegulations",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      buttonText: "Go to eRegs",
      buttonLink: "https://eregulations.cms.gov/",
    },
    {
      id: 5,
      title: "Laserfische",
      content: "Subtitle for LaserFishe",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      buttonText: "Go to Laserfische",
      buttonLink: "https://cmsrio.cms.local/laserfiche",
    },
    {
      id: 6,
      title: "MMDL",
      content: "Medicaid Model Data Lab",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      buttonText: "Go to MMDL",
      buttonLink: "https://wms-mmdl.cms.gov/MMDL/faces/portal.jsp",
    },
  ];

  const renderCard = (card: (typeof cards)[number]) => (
    <div className="w-full md:w-[616px]">
      <div
        key={card.id}
        className="min-h-[229px] border rounded-[3px] bg-white flex flex-col justify-between"
      >
        <div className="pl-[24px] pr-4 pt-4">
          <h3 className="font-bold text-lg mb-[16px]">{card.title}</h3>
          <p className="font-semibold text-sm text-gray-800 mb-[16px]">{card.content}</p>
          <p className="text-sm text-gray-600">{card.body}</p>
        </div>
        <div className="pl-[24px] mt-[16px] mb-[24px]">
          <a
            href={card.buttonLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-bold border-2 border-[#0071BC] text-[#0071BC] px-4 py-2 rounded hover:bg-[#0071BC] hover:text-white transition-colors duration-200"
          >
            {card.buttonText}
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-[110px] 2xl:px-[110px]">
      <div className="flex flex-row justify-center gap-8">
        {/* Search section */}
        <div>
          <h1>Search Left</h1>
        </div>
        <div>
          <h1>Search Right</h1>
        </div>
      </div>

      <div className="w-full max-w-[1439px] mx-auto">
        {/* Latest Updates Banner */}
        <div className="mt-[56px] mx-auto w-full max-w-[1440px] h-auto min-h-[228px] border-[2px] border-gray-300 rounded-[3px] bg-gray-100 px-[24px] py-[24px] flex flex-col gap-[16px]">
          <LatestUpdates />
        </div>

        {/* Access Header */}
        <div className="pt-[56px] pb-[25px] pl-[24px]">
          <h2 className="text-2xl font-semibold">Access more SPA and waiver systems</h2>
        </div>

        {/* Cards Section */}
        <div className="w-full h-auto py-[8px] pr-[143px] pb-[87px]">
          <div className="flex flex-col gap-y-[40px]">
            {[0, 2, 4].map((i) => (
              <div key={i} className="flex flex-col md:flex-row gap-[40px]">
                {renderCard(cards[i])}
                {cards[i + 1] && renderCard(cards[i + 1])}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const CMSWelcomeWrapper = () => {
  const isCmsHomepageEnabled = useFeatureFlag("CMS_HOMEPAGE_FLAG");
  console.log({ isCmsHomepageEnabled });

  const contactInfo = useMemo(
    () => ({
      email: "OneMAC_Helpdesk@cms.hhs.gov",
      address: {
        street: "7500 Security Blvd.",
        city: "Baltimore",
        state: "MD",
        zip: 21244,
      },
    }),
    [],
  );

  return (
    <>
      {isCmsHomepageEnabled ? <CMSWelcome /> : <Welcome />}
      <Footer
        email={contactInfo.email}
        address={contactInfo.address}
        showNavLinks={isCmsHomepageEnabled}
      />
    </>
  );
};

export default CMSWelcomeWrapper;
