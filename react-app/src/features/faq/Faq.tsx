import { useCallback, useEffect, useState } from "react";
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

import { helpDeskContact, oneMACFAQContent } from "./content/oneMACFAQContent";

export const Faq = () => {
  // check if the FAQ Toggle flag is "on" and redirrect if so
  const isFAQHidden = useFeatureFlag("TOGGLE_FAQ");

  const { id } = useParams<{ id: string }>();

  const [openItems, setOpenItems] = useState<string[]>([]);

  const expandAll = useCallback(() => {
    const allIds = [];
    oneMACFAQContent.forEach(({ qanda }) => {
      qanda.forEach(({ anchorText }) => allIds.push(anchorText));
    });
    setOpenItems(allIds);
  }, [setOpenItems]);

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

  // Get the flag value for hiding the MMDL banner.
  const isBannerHidden = useFeatureFlag("UAT_HIDE_MMDL_BANNER");
  const anchorsToHide = [
    "spa-admendments",
    "abp-spa-templates",
    "abp-implementation-guides-spa",
    "mpc-spa-templates",
    "mpc-spa-implementation-guides",
    "chip-spa-templates",
    "chip-spa-implentation-guides",
  ];

  const filteredFAQContent = oneMACFAQContent.map((section) => {
    if (section.sectionTitle === "State Plan Amendments (SPAs)" && isBannerHidden) {
      return {
        ...section,
        qanda: section.qanda.filter((qa) => !anchorsToHide.includes(qa.anchorText)),
      };
    }
    return section;
  });

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
              onClick={expandAll}
              variant="outline"
              data-testid="expand-all"
              className="w-full xs:w-fit hover:bg-transparent mb-5"
            >
              Expand all to search with CTRL + F
            </Button>

            {/* FAQ */}
            <Accordion type="multiple" value={openItems} onValueChange={setOpenItems}>
              {filteredFAQContent.map(({ sectionTitle, qanda }) => (
                <article key={sectionTitle} className="mb-8">
                  <h2 className="text-2xl mb-4 text-primary">{sectionTitle}</h2>
                  {qanda.map(({ anchorText, answerJSX, question }) => (
                    <AccordionItem
                      value={anchorText}
                      id={anchorText}
                      key={anchorText}
                      data-testid={anchorText}
                    >
                      <AccordionTrigger className="text-left">{question}</AccordionTrigger>
                      <AccordionContent>{answerJSX}</AccordionContent>
                    </AccordionItem>
                  ))}
                </article>
              ))}
            </Accordion>
          </article>
        </div>
        <div>
          <CardWithTopBorder>
            <div className="p-4">
              <h3 className="text-lg text-bold mb-4">OneMAC Help Desk Contact Info</h3>
              <div>
                <b>Phone Number</b>
                <p className="mb-4 text-primary">
                  <a className="underline" href={`tel:${helpDeskContact.phone}`}>
                    {helpDeskContact.phone}
                  </a>
                </p>
                <b>Email</b>
                <p className="text-primary">
                  <a className="underline" href={`mailto:${helpDeskContact.email}`}>
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
