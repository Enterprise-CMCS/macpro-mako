import React from "react";
import { Accordion, AccordionItem, AccordionContent, AccordionTrigger } from "@/components";
import ContactHelpDesk from "./contactHelpDesk";

const LeftNavigation: React.FC = () => {
  return (
    <div className="h-full bg-white p-4 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 font-serif">Topics</h2>
      <Accordion type="multiple">
        {[
          "General",
          "Package actions",
          "Implementation guides",
          "Access & roles",
          "User profile",
          "Glossary",
        ].map((item) => (
          <AccordionItem value={item} key={item} className="border-none font-semibold">
            <AccordionTrigger className="text-gray-700 hover:text-gray-900 py-2">
              <div className="font-semibold">{item}</div>
            </AccordionTrigger>
            <AccordionContent>{/* Content for each section can be added here */}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <ContactHelpDesk />
    </div>
  );
};

export default LeftNavigation;
