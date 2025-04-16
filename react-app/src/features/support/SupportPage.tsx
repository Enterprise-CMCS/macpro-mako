import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router";
import { isCmsUser } from "shared-utils";

import { useGetUser } from "@/api/useGetUser";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  BreadCrumbBar,
  BreadCrumbSeperator,
  ContactHelpDesk,
  ExpandCollapseBtn,
  LeftNavigation,
  SearchContent,
  StatusLabel,
  SupportSubNavHeader,
  ToggleGroup,
  ToggleGroupItem,
} from "@/components";
import { FAQContentType } from "@/features/support/SupportMockContent";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { cn } from "@/utils";

import { oneMACCMSContent, oneMACStateFAQContent, QuestionAnswer } from "./SupportMockContent";

const FaqAccordion = ({
  question,
  latestOpened,
}: {
  question: QuestionAnswer[];
  latestOpened: string;
}) => {
  return (
    <>
      {question.map(({ anchorText, answerJSX, question, statusLabel }) => {
        const oulineLatest = latestOpened === anchorText ? "border-blue-500 border-2 " : "";
        return (
          <AccordionItem
            value={anchorText}
            id={`${anchorText}-support`}
            data-testid={`${anchorText}-support`}
            key={anchorText}
            className="my-6 border-none"
          >
            <AccordionTrigger
              showPlusMinus
              className={cn(
                "text-left font-bold bg-neutral-100 px-5 hover:no-underline",
                oulineLatest,
              )}
            >
              <div className="flex">
                {statusLabel && <StatusLabel type={statusLabel} />}{" "}
                <span className="hover:underline">{question}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="bg-white pt-4">{answerJSX}</AccordionContent>
          </AccordionItem>
        );
      })}
    </>
  );
};

export const SupportPage = () => {
  const { id } = useParams<{ id: string }>();
  const isSupportPageShown = useFeatureFlag("TOGGLE_FAQ");
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);
  const { data: userObj } = useGetUser();
  const isCmsView = isCmsUser(userObj.user);

  const [supportContent, setSupportContent] = useState(
    isCmsView ? oneMACCMSContent : oneMACStateFAQContent,
  );
  const [tgValue, setTGValue] = useState<"cms" | "state">(isCmsView ? "cms" : "state");
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const startingSupportContent = useMemo(() => {
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

  const latestOpenedFAQ = areAllAccordionsOpen ? "" : openAccordions[openAccordions.length - 1];

  const setSearchResults = (searchResults: FAQContentType[], isSearching?: boolean) => {
    setIsSearching(isSearching);

    if (isSearching && searchResults[0].qanda.length) {
      setSupportContent(searchResults);
      setOpenAccordions([searchResults[0].qanda[0].anchorText]);
    } else if (isSearching) setSupportContent(searchResults);
    else {
      collapseAll();
      setSupportContent(startingSupportContent);
    }
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

  if (!isSupportPageShown || !userObj?.user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex flex-col">
      <SupportSubNavHeader>
        <h1 className="text-4xl font-semibold">OneMAC Support</h1>
        <SearchContent
          placeholderText="Search OneMAC support"
          supportContent={startingSupportContent}
          setSearchResults={setSearchResults}
          isSearching={isSearching}
        />
      </SupportSubNavHeader>

      {/* only display the toggle CMS/State view when the user is CMS */}
      {isCmsView && !isSearching && (
        <div className="max-w-screen-xl m-auto px-4 lg:px-8 w-full pt-8">
          <div className="flex justify-end">
            <div className="w-2/3 px-4 lg:px-8">
              <ToggleGroup
                type="single"
                aria-label="CMS State Toggle"
                data-testid="cms-toggle-group"
                value={tgValue}
                onValueChange={(value: "cms" | "state") => {
                  if (value) {
                    setTGValue(value);
                    if (value === "cms") setSupportContent(oneMACCMSContent);
                    else setSupportContent(oneMACStateFAQContent);
                  }
                }}
              >
                <ToggleGroupItem value="cms" aria-label="cms">
                  CMS
                </ToggleGroupItem>
                <ToggleGroupItem value="state" aria-label="state">
                  States
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
          <hr className="bg-slate-100 h-[1.2px]" />
        </div>
      )}

      {/* Main Layout Wrapper with explicit widths */}
      <div className="max-w-screen-xl m-auto px-4 lg:px-8 pt-4 w-full">
        <div className="flex">
          {/* Left Navigation - Fixed width with explicit max-width */}
          <div className="w-1/3 sticky top-20 h-[calc(100vh-5rem)]">
            {isSearching && (
              <BreadCrumbBar>
                <li>
                  <a
                    onClick={() => setSearchResults([], false)}
                    className="underline cursor-pointer text-sky-700 hover:text-sky-800 flex items-center text-sm"
                  >
                    Support
                  </a>
                </li>
                <BreadCrumbSeperator />
                <li className="flex items-center text-sm">Search Results</li>
              </BreadCrumbBar>
            )}
            {!isSearching && (
              <LeftNavigation topics={supportContent.flatMap(({ sectionTitle }) => sectionTitle)} />
            )}
            <ContactHelpDesk />
          </div>

          {/* Content - Force minimum width */}
          <section className="w-2/3 block max-w-screen-xl px-4 lg:px-8 gap-10">
            <div className="">
              <div className="flex justify-end py-4">
                <ExpandCollapseBtn
                  collapseAll={collapseAll}
                  expandAll={expandAll}
                  areAllOpen={areAllAccordionsOpen}
                />
              </div>
              <hr className="bg-gray-300 h-[1.2px]" />
            </div>
            <div className="flex-1 mt-8">
              <Accordion type="multiple" value={openAccordions} onValueChange={setOpenAccordions}>
                {supportContent.map(({ sectionTitle, qanda }) => (
                  <article key={sectionTitle} className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">{sectionTitle}</h2>
                    {!isSearching && <hr className="bg-gray-300 h-[1.7px]" />}
                    <FaqAccordion question={qanda} latestOpened={latestOpenedFAQ} />
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
