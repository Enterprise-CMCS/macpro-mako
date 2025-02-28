// import { useEffect, useState } from "react";

import { SubNavHeader } from "@/components";
import LeftNavigation from "./content/navigationBar";
import { useCallback, useEffect, useState } from "react";
import { oneMACFAQContent } from "./content/oneMACFAQContent";
import { Accordion, AccordionItem, AccordionContent, AccordionTrigger, Button } from "@/components";
import { useParams } from "react-router";

export const NewFaq = () => {
  const { id } = useParams<{ id: string }>();

  const [openItems, setOpenItems] = useState<string[]>([]);

  const expandAll = useCallback(() => {
    const allIds = [];
    oneMACFAQContent.forEach(({ qanda }) => {
      qanda.forEach(({ anchorText }) => allIds.push(anchorText));
    });
    setOpenItems(allIds);
  }, [setOpenItems]);

  const closeAll = useCallback(() => {
    setOpenItems([]);
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
    <div className="min-h-screen flex flex-col">
      <SubNavHeader>
        <h1 className="text-xl font-medium">Frequently Asked Questions</h1>
      </SubNavHeader>

      {/* We will put the buttons here for now */}
      <div className="flex flex-row justify-around align-center p-2">
        <Button
          onClick={expandAll}
          variant="outline"
          data-testid="banner-close"
          className="w-full xs:w-fit hover:bg-transparent"
        >
          Expand All
        </Button>

        <Button
          onClick={closeAll}
          variant="outline"
          data-testid="banner-close"
          className="w-full xs:w-fit hover:bg-transparent"
        >
          Close All
        </Button>
      </div>

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
          </section>
        </div>
      </div>
    </div>
  );
};
