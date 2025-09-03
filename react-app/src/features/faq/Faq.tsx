import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  CardWithTopBorder,
  SubNavHeader,
} from "@/components";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

import { oneMACFAQContent } from "./faqs";
import { helpDeskContact } from "./faqs/utils";

export const Faq = () => {
  const isFAQHidden = useFeatureFlag("TOGGLE_FAQ");

  // Get the flag value for hiding the MMDL banner.
  const isBannerHidden = useFeatureFlag("UAT_HIDE_MMDL_BANNER");
  const isUpdateNewLabel = useFeatureFlag("UPGRADE_NEW_LABEL");
  const isChipSpaDetailsEnabled = useFeatureFlag("CHIP_SPA_DETAILS");

  const faqContent = useMemo(() => {
    return oneMACFAQContent({ isChipSpaDetailsEnabled, isBannerHidden });
  }, [isChipSpaDetailsEnabled, isBannerHidden]);

  const { id } = useParams<{ id: string }>();

  const [openItems, setOpenItems] = useState<string[]>([]);

  const expandAll = useCallback(() => {
    const allIds = [];
    faqContent.forEach(({ qanda }) => {
      qanda.forEach(({ anchorText }) => allIds.push(anchorText));
    });
    setOpenItems(allIds);
  }, [setOpenItems, faqContent]);

  useEffect(() => {
    if (id) {
      const element = document.getElementById(id);
      if (element) {
        setOpenItems([id]);
        window.scrollTo({
          top: element.offsetTop,
          behavior: "smooth",
        });
      }
    }
  }, [id]);

  if (isFAQHidden) {
    return <Navigate to="/" replace />;
  }
  return (
    <>
      <SubNavHeader>
        <h1 className="text-xl font-medium">Frequently Asked Questions</h1>
      </SubNavHeader>
      <section className="block md:flex md:flex-row max-w-screen-xl m-auto px-4 lg:px-8 pt-8 gap-10">
        <div className="flex-1">
          <article className="mb-8">
            {/* BUTTON */}
            <Button
              onClick={() => {
                expandAll();
                sendGAEvent("support_click_general_expand-all", {
                  event_category: "Support",
                  event_label: "Expand All",
                });
              }}
              variant="outline"
              data-testid="expand-all"
              className="w-full xs:w-fit hover:bg-transparent mb-5"
            >
              Expand all to search with CTRL + F
            </Button>

            {/* FAQ */}
            <Accordion type="multiple" value={openItems} onValueChange={setOpenItems}>
              {faqContent.map(({ sectionTitle, qanda }) => (
                <article key={sectionTitle} className="mb-8">
                  <h2 className="text-2xl mb-4 text-primary">{sectionTitle}</h2>
                  {qanda.map(({ anchorText, answerJSX, question, label, labelColor }) => (
                    <AccordionItem
                      value={anchorText}
                      id={anchorText}
                      key={anchorText}
                      data-testid={anchorText}
                    >
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          {isUpdateNewLabel && label && (
                            <span
                              className={`text-white text-xs font-semibold px-2 py-0.5 rounded no-underline hover:no-underline ${
                                labelColor === "green"
                                  ? "bg-[#2E8540]"
                                  : labelColor === "blue"
                                    ? "bg-[#0050D8]"
                                    : "bg-gray-500"
                              }`}
                            >
                              {label}
                            </span>
                          )}
                          <span className="hover:underline">{question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>{answerJSX}</AccordionContent>
                    </AccordionItem>
                  ))}
                </article>
              ))}
            </Accordion>
          </article>
        </div>
        <div>
          <CardWithTopBorder className="sticky top-5">
            <div className="p-4">
              <h3 className="text-lg text-bold mb-4">OneMAC Help Desk Contact Info</h3>
              <div>
                <b>Phone Number</b>
                <p className="mb-4 text-primary">
                  <a
                    className="underline"
                    href={`tel:${helpDeskContact.phone}`}
                    onClick={() => sendGAEvent("support_contact_phone")}
                  >
                    {helpDeskContact.phone}
                  </a>
                </p>
                <b>Email</b>
                <p className="text-primary">
                  <a
                    className="underline"
                    href={`mailto:${helpDeskContact.email}`}
                    onClick={() => sendGAEvent("support_contact_email")}
                  >
                    {helpDeskContact.email}
                  </a>
                </p>
              </div>
            </div>
          </CardWithTopBorder>
        </div>
      </section>
    </>
  );
};
