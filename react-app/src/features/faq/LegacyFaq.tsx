import { useEffect, useState, useCallback } from "react";
import { helpDeskContact, oneMACFAQContent } from "./content/oneMACFAQContent";
import {
  Accordion,
  CardWithTopBorder,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
  SubNavHeader,
  Button,
} from "@/components";
import { useParams } from "react-router";

export const LegacyFaq = () => {
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
              data-testid="banner-close"
              className="w-full xs:w-fit hover:bg-transparent mb-5"
            >
              Expand all to search with CTRL + F
            </Button>

            {/* FAQS */}
            <Accordion type="multiple" value={openItems} onValueChange={setOpenItems}>
              {oneMACFAQContent.map(({ sectionTitle, qanda }) => (
                <article key={sectionTitle} className="mb-8">
                  <h2 className="text-2xl mb-4 text-primary">{sectionTitle}</h2>
                  {qanda.map(({ anchorText, answerJSX, question }) => (
                    <AccordionItem value={anchorText} id={anchorText} key={anchorText}>
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
