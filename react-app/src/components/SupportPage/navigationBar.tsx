import React from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components";

import ContactHelpDesk from "./contactHelpDesk";

interface LeftNavigationProps {
  topics: string[];
}

const LeftNavigation = ({ topics }: LeftNavigationProps) => {
  return (
    <div className="w-full pr-4">
      <h2 className="text-2xl font-bold mb-6 font-serif">Topics</h2>
      <Accordion type="multiple">
        {topics.map((item) => (
          <AccordionItem value={item} key={item} className="border-none">
            <AccordionTrigger className="text-gray-700 hover:text-gray-900 py-2">
              <div className="font-semibold">{item}</div>
            </AccordionTrigger>
            <AccordionContent></AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <ContactHelpDesk />
    </div>
  );
};

export default LeftNavigation;
