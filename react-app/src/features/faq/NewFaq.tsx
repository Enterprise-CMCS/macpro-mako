// import { useEffect, useState } from "react";

import { SubNavHeader } from "@/components";
import LeftNavigation from "./content/navigationBar";
import { useEffect, useState } from "react";
import { oneMACFAQContent } from "./content/oneMACFAQContent";
import ExpandCollapseBtn from "./content/expandCollapseBtn";
import { Accordion, AccordionItem, AccordionContent, AccordionTrigger } from "@/components";
import { useParams } from "react-router";

export const NewFaq = () => {
  const { id } = useParams<{ id: string }>();
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);

  const expandAll = () => {
    const allIds = [];
    oneMACFAQContent.flatMap(({ qanda }) => {
      qanda.map(({ anchorText }) => allIds.push(anchorText));
    });
    setOpenAccordions(allIds);
  };

  const collapseAll = () => {
    setOpenAccordions([]);
  };

  useEffect(() => {
    if (id) {
      const element = document.getElementById(id);
      if (element) {
        setOpenAccordions([id]);
        window.scrollTo({
          top: element.offsetTop,
          behavior: "smooth",
        });
      }
    }
  }, [id]);

  const tempFAQ = oneMACFAQContent[0].qanda.toSpliced(0, 3);
  return (
    <div className="min-h-screen flex flex-col">
      <SubNavHeader>
        <h1 className="text-xl font-medium">OneMAC Support</h1>
      </SubNavHeader>

      {/* Main Layout Wrapper with explicit widths */}
      <div className="max-w-screen-xl m-auto px-4 lg:px-8 pt-8 w-full">
        <div className="flex">
          {/* Left Navigation - Fixed width with explicit max-width */}
          <div className="w-64 sticky top-0 h-[calc(100vh-4rem)]">
            <LeftNavigation />
          </div>

          {/* Content - Force minimum width */}
          <section className="block md:flex md:flex-row max-w-screen-xl m-auto px-4 lg:px-8 pt-8 gap-10">
            <div className="flex-1">
              <article className="mb-8">
                <Accordion type="multiple" value={openAccordions} onValueChange={setOpenAccordions}>
                  <article key={"FAQs"} className="mb-8">
                    <div className="flex justify-between">
                      <h2 className="text-2xl mb-4 font-bold">Frequently asked questions (FAQs)</h2>
                      <ExpandCollapseBtn collapseAll={collapseAll} expandAll={expandAll} />
                    </div>
                    <hr className="bg-slate-300 h-0.5" />

                    {/* REMOVE LATER */}
                    {tempFAQ.map(({ anchorText, answerJSX, question }) => (
                      <AccordionItem
                        value={anchorText}
                        id={anchorText}
                        data-testid={anchorText}
                        key={anchorText}
                      >
                        <AccordionTrigger className="text-left">{question}</AccordionTrigger>
                        <AccordionContent>{answerJSX}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </article>
                  {oneMACFAQContent.map(({ sectionTitle, qanda }) => (
                    <article key={sectionTitle} className="mb-8">
                      <h2 className="text-2xl font-bold mb-4">{sectionTitle}</h2>
                      <hr className="bg-slate-300 h-0.5" />
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
          </section>
        </div>
      </div>
    </div>
  );
};
