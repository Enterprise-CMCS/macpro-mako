import {Button} from "@/components/Inputs";
import {Link} from "react-router-dom";
import {ReactElement} from "react";
export enum ExternalSystem {
    MAC_PRO = "https://www.medicaid.gov/resources-for-states/medicaid-and-chip-program-macpro-portal/index.html#MACPro",
    MMDL = "https://wms-mmdl.cms.gov/MMDL/faces/portal.jsp",
}

export interface ExternalAppLandingPageConfig {
    pageTitle: string;
    image: ReactElement;
    description: ReactElement;
    buttonLabel: string;
    buttonLink: string;
}

/* TODO: Get desired FAQ `target` from Wale */
const FAQHelperText = () => (
    <span className="landing-description">
    <i>
      For additional information on where to submit, refer to the{" "}
        {/* TODO: Replace `to` with ROUTES constant */}
        <Link target={"_faq"} to={"/faq"}>
            Crosswalk from Paper-based State Plan to MACPro and MMDL
        </Link>{" "}
        document in our FAQ section.
    </i>
  </span>
);

/** Config-driven template to build landing pages that link to another site / app. */
const ExternalAppLandingPage = ({
   pageTitle,
   image,
   description,
   buttonLabel,
   buttonLink,
}: ExternalAppLandingPageConfig) => {
    return (
        <>
            {/* TODO: Simple page title bar */}
            <div className="landing-container">
                <div className="landing-logo">{image}</div>
                <section className="landing-description">{description}</section>
                <a href={buttonLink} target="_blank" rel="noreferrer">
                    <Button className="landing-button">
                        {buttonLabel}
                    </Button>
                </a>
                <FAQHelperText />
            </div>
        </>
    );
};

export default ExternalAppLandingPage;