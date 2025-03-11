// import { useEffect, useState } from "react";

import { SupportSubNavHeader } from "@/components";
import LeftNavigation from "../../components/SupportPage/navigationBar";
import { useEffect, useState } from "react";
import { oneMACFAQContent, QuestionAnswer } from "./content/SupportMockContent";
import ExpandCollapseBtn from "../../components/SupportPage/expandCollapseBtn";
import { Accordion, AccordionItem, AccordionContent, AccordionTrigger } from "@/components";
import { useParams } from "react-router";

const FaqAccordion = ({ question }: { question: QuestionAnswer[] }) => {
  return (
    <>
      {question.map(({ anchorText, answerJSX, question }) => (
        <AccordionItem
          value={anchorText}
          id={anchorText}
          data-testid={anchorText}
          key={anchorText}
          className="border-none my-6"
        >
          <AccordionTrigger showPlusMinus className="text-left font-bold bg-neutral-100 px-5">
            {question}
          </AccordionTrigger>
          <AccordionContent className="bg-white pt-4">{answerJSX}</AccordionContent>
        </AccordionItem>
      ))}
    </>
  );
};

export const SupportPage = () => {
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

  const areAllAccordionsOpen = (function () {
    const totalQandas = oneMACFAQContent.reduce((total, section) => {
      return total + section.qanda.length;
    }, 0);
    if (openAccordions.length >= totalQandas) return true;
    return false;
  })();

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

  return (
    <div className="min-h-screen flex flex-col">
      <SupportSubNavHeader>
        <h1 className="text-4xl font-bold">OneMAC Support</h1>
      </SupportSubNavHeader>

      {/* Main Layout Wrapper with explicit widths */}
      <div className="max-w-screen-xl m-auto px-4 lg:px-8 pt-8 w-full">
        <div className="flex">
          {/* Left Navigation - Fixed width with explicit max-width */}
          <div className="w-1/3 sticky top-20 h-[calc(100vh-16rem)]">
            <LeftNavigation />
          </div>

          {/* Content - Force minimum width */}
          <section className="w-2/3 block md:flex md:flex-row max-w-screen-xl m-auto px-4 lg:px-8 pt-8 gap-10">
            <div className="flex-1">
              <Accordion type="multiple" value={openAccordions} onValueChange={setOpenAccordions}>
                {oneMACFAQContent.map(({ sectionTitle, qanda }, index) => (
                  <article key={sectionTitle} className="mb-8">
                    {/* The first article has the expand button on the right */}
                    {index === 0 ? (
                      <div className="flex justify-between">
                        <h2 className="text-2xl mb-4 font-bold">{sectionTitle}</h2>
                        <ExpandCollapseBtn
                          collapseAll={collapseAll}
                          expandAll={expandAll}
                          areAllOpen={areAllAccordionsOpen}
                        />
                      </div>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold mb-4">{sectionTitle}</h2>
                        <hr className="bg-gray-400 h-0.5" />
                      </>
                    )}
                    <FaqAccordion question={qanda} />
                  </article>
                ))}
              </Accordion>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
