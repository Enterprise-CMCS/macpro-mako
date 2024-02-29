import { useEffect, useState } from "react";
import { helpDeskContact, oneMACFAQContent } from "./content/oneMACFAQContent";
import {
  Accordion,
  CardWithTopBorder,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
  SubNavHeader,
  useParams,
} from "@/components";

export const Faq = () => {
  const { id } = useParams("/faq/:id");

  const [openItems, setOpenItems] = useState<string[]>([]);
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
          {oneMACFAQContent.map(({ sectionTitle }) => (
            <article key={sectionTitle} className="mb-8">
              <Accordion
                type="multiple"
                value={openItems}
                onValueChange={setOpenItems}
              >
                {oneMACFAQContent.map(({ sectionTitle, qanda }) => (
                  <article key={sectionTitle} className="mb-8">
                    <h2 className="text-2xl mb-4 text-primary">
                      {sectionTitle}
                    </h2>
                    {qanda.map(({ anchorText, answerJSX, question }) => (
                      <AccordionItem
                        value={anchorText}
                        id={anchorText}
                        key={anchorText}
                      >
                        <AccordionTrigger>{question}</AccordionTrigger>
                        <AccordionContent>{answerJSX}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </article>
                ))}
              </Accordion>
            </article>
          ))}
        </div>
        <div>
          <CardWithTopBorder>
            <div className="p-4">
              <h3 className="text-lg text-bold mb-4">
                OneMAC Help Desk Contact Info
              </h3>
              <div>
                <b>Phone Number</b>
                <p className="mb-4 text-primary">
                  <a
                    className="underline"
                    href={`tel:${helpDeskContact.phone}`}
                  >
                    {helpDeskContact.phone}
                  </a>
                </p>
                <b>Email</b>
                <p className="text-primary">
                  <a
                    className="underline"
                    href={`mailto:${helpDeskContact.email}`}
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
