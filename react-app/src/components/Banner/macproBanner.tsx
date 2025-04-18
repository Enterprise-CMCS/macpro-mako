import { useFeatureFlag } from "@/hooks/useFeatureFlag";

const TopBanner = () => {
  const isStateHomepage = useFeatureFlag("STATE_HOMEPAGE_FLAG");
  const isCMSHomepage = useFeatureFlag("CMS_HOMEPAGE_FLAG");

  // Show nothing if neither flag is on
  if (!isStateHomepage && !isCMSHomepage) return null;

  // Button sets
  const stateLinks = [
    { label: "MACPro", href: "https://macpro.cms.gov/suite" },
    { label: "WMS", href: "https://wms-mmdl.cms.gov/WMS/faces/portal.jsp" },
    { label: "MMDL", href: "https://wms-mmdl.cms.gov/MMDL/faces/portal.jsp" },
  ];

  const cmsLinks = [
    { label: "MACPro", href: "https://macpro.cms.gov/suite" },
    { label: "SEA TOOL", href: "https://seatool.cms.gov" },
    { label: "WMS", href: "https://wms-mmdl.cms.gov/WMS/faces/portal.jsp" },
    { label: "eRegs", href: "https://www.ecfr.gov/current/title-42" },
    { label: "Laserfiche", href: "https://lf.cms.gov" },
    { label: "MMDL", href: "https://wms-mmdl.cms.gov/MMDL/faces/portal.jsp" },
  ];

  const linksToRender = isCMSHomepage ? cmsLinks : isStateHomepage ? stateLinks : [];

  return (
    <div className="w-full h-[64px] bg-[#205493] flex items-center">
      <div className="w-full max-w-screen-xl mx-auto flex gap-8 text-white text-sm font-semibold px-4 lg:px-8 flex-wrap">
        {linksToRender.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
};

export default TopBanner;
