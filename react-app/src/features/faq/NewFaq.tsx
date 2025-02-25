// import { useEffect, useState } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, CardWithTopBorder, SubNavHeader } from "@/components";
import { helpDeskContact, oneMACFAQContent } from "./content/oneMACFAQContent";
import LeftNavigation from "./content/navigationBar";

export const  NewFaq = (props : any) => {
  return (
    <div className="min-h-screen flex flex-col">
    <SubNavHeader>
      <h1 className="text-xl font-medium">Frequently Asked Questions</h1>
    </SubNavHeader>

    {/* Main Layout Wrapper - Contains FAQ and Left Navigation */}
    <section className="relative flex max-w-screen-xl m-auto px-4 lg:px-8 pt-8 gap-6 flex-grow">
      {/* Left Navigation */}
      <div className="w-60 shrink-0 sticky top-0 max-h-screen pt-4">
        <LeftNavigation />
      </div>

      {/* FAQ Content */}
      <div className="flex-1">
        <article className="mb-8">
          FAQ Content
        </article>
      </div>
    </section>
  </div>
  );
};
