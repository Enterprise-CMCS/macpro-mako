import { useFeatureFlag } from "@/hooks/useFeatureFlag";

const TopBanner = () => {
  const isStateHomepage = useFeatureFlag("STATE_HOMEPAGE_FLAG");

  if (!isStateHomepage) return null;

  return (
    <div className="w-full h-[64px] bg-[#205493] flex items-center">
      <div className="flex gap-8 text-white text-sm font-semibold px-4 lg:pl-[137px] w-full">
        <a
          href="https://macpro.cms.gov/suite"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          MACPro
        </a>
        <a
          href="https://wms-mmdl.cms.gov/WMS/faces/portal.jsp"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          WMS
        </a>
        <a
          href="https://wms-mmdl.cms.gov/MMDL/faces/portal.jsp"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          MMDL
        </a>
      </div>
    </div>
  );
};

export default TopBanner;
