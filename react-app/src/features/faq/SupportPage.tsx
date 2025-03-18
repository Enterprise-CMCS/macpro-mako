import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  SupportSubNavHeader,
} from "@/components";
import { cn } from "@/utils";

import ExpandCollapseBtn from "../../components/SupportPage/expandCollapseBtn";
import LeftNavigation from "../../components/SupportPage/navigationBar";
import {
  oneMACCMSContent,
  oneMACStateFAQContent,
  QuestionAnswer,
} from "./content/SupportMockContent";

const FaqAccordion = ({ question }: { question: QuestionAnswer[] }) => {
  return (
    <>
      {question.map(({ anchorText, answerJSX, question }) => (
        <AccordionItem
          value={anchorText}
          id={`${anchorText}-support`}
          data-testid={`${anchorText}-support`}
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

const toggleGroupItemStyle =
  "inline-flex items-center justify-center px-3 py-1.5 text-2xl bg-neutral-100 rounded-xs ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus:outline-none disabled:pointer-events-none disabled:opacity-50 border-b-4 border-b-transparent ";

const toggleGroupItemActiveStyle =
  "data-[state=on]:border-b-primary-dark data-[state=on]:bg-blue-50 data-[state=on]:text-primary-dark data-[state=on]:font-bold";
export const SupportPage = () => {
  const { id } = useParams<{ id: string }>();
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);
  const [tgValue, setTGValue] = useState<"cms" | "state">("cms");

  const supportContent = useMemo(() => {
    if (tgValue === "cms") return oneMACCMSContent;
    return oneMACStateFAQContent;
  }, [tgValue]);

  const expandAll = () => {
    const allIds = supportContent.flatMap(({ qanda }) => qanda.map(({ anchorText }) => anchorText));
    setOpenAccordions(allIds);
  };

  const collapseAll = () => {
    setOpenAccordions([]);
  };

  const areAllAccordionsOpen = (function () {
    const totalQandas = supportContent.reduce((total, section) => {
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

      <div className="flex max-w-screen-xl m-auto px-4 lg:px-8 pt-8 w-full border-b-2 border-b-slate-100 justify-end">
        <div className="w-2/3 px-4 lg:px-8">
          <ToggleGroup
            className="ToggleGroup"
            type="single"
            aria-label="Text alignment"
            value={tgValue}
            onValueChange={(value: "cms" | "state") => {
              if (value) setTGValue(value);
            }}
          >
            <ToggleGroupItem
              className={cn(toggleGroupItemStyle, toggleGroupItemActiveStyle)}
              value="cms"
              aria-label="cms"
            >
              CMS
            </ToggleGroupItem>
            <ToggleGroupItem
              className={cn(toggleGroupItemStyle, toggleGroupItemActiveStyle)}
              value="state"
              aria-label="state"
            >
              States
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Main Layout Wrapper with explicit widths */}
      <div className="max-w-screen-xl m-auto px-4 lg:px-8 pt-8 w-full">
        <div className="flex">
          {/* Left Navigation - Fixed width with explicit max-width */}
          <div className="w-1/3 sticky top-20 h-[calc(100vh-5rem)] sm:-z-10">
            <LeftNavigation />
          </div>

          {/* Content - Force minimum width */}
          <section className="w-2/3 block md:flex md:flex-row max-w-screen-xl m-auto px-4 lg:px-8 pt-8 gap-10">
            <div className="flex-1">
              <Accordion type="multiple" value={openAccordions} onValueChange={setOpenAccordions}>
                {supportContent.map(({ sectionTitle, qanda }, index) => (
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
                      <h2 className="text-2xl font-bold mb-4">{sectionTitle}</h2>
                    )}
                    <hr className="bg-gray-400 h-0.5" />
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
