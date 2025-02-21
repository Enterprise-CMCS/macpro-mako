import { useEffect, useState } from "react";
import { helpDeskContact, oneMACFAQContent } from "./content/oneMACFAQContent";
import {
  Accordion,
  CardWithTopBorder,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
  SubNavHeader,
} from "@/components";
import { useParams } from "react-router";
import LeftNavigation from "./content/navigationBar";

export const Faq = () => {
  const { id } = useParams<{ id: string }>();

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
    
    {/* Main Layout Wrapper */}
    <section className="flex max-w-screen-xl m-auto px-4 lg:px-8 pt-8 gap-8">
      
      {/* Left Navigation - Sticks below the header */}
      <div className="w-60 shrink-0 h-screen sticky top-[80px] overflow-y-auto">
        <LeftNavigation />
      </div>

      {/* FAQ Content - Positioned next to the Left Nav */}
      <div className="flex-1 pl-8">
        <article className="mb-8">
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

      {/* Help Desk Section */}
      <div className="w-64">
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
