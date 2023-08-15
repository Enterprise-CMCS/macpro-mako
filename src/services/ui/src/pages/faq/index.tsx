import PageTitleBar from "../../components/PageTitleBar/PageTitleBar";
import { helpDeskContact } from "../../lib/faq/helpDeskContact";
import { oneMACFAQContent } from "../../lib/faq/faqContent";
import "flowbite";
import { Accordion, AccordionItem } from "@cmsgov/design-system";
import {useState} from "react";
export const FAQ = () => {
/*
  const FaqDetails = () => {
    return (
    <>{oneMACFAQContent.map((section, index) => (
      <div key={index} className="faq-section">
        <h2 className="topic-title">{section.sectionTitle}</h2>
        <Accordion>
          {section.qanda.map((questionAnswer, i) => (
            <div key={i}>
              <AccordionItem
                id={questionAnswer.anchorText}
                heading={questionAnswer.question}
                buttonClassName="accordion-button"
                contentClassName="accordion-content"
              >
                {questionAnswer.answerJSX}
              </AccordionItem>
              <hr></hr>
            </div>
          ))}
        </Accordion>
      </div>
    ))}</>
    );
  };
*/

const FAQAccordion = () => {
  const [activeAccordion, setActiveAccordion] = useState(null || "");
  const initIconRotations:any = []
  const [iconRotations, setIconRotations] = useState(initIconRotations);

  const handleAccordionToggle = (sectionIndex:any, qandaIndex:any) => {
    const newActiveAccordion:any = `${sectionIndex}-${qandaIndex}`;

    //setActiveAccordion(newActiveAccordion);

    const newIconRotations:any = [...iconRotations];    
    if ( activeAccordion === newActiveAccordion) {
      newIconRotations[newActiveAccordion] = "M9 5 5 1 1 5"
      setActiveAccordion("");
    }else{
      newIconRotations[newActiveAccordion] = "M9 1 5 5 1 1"
      setActiveAccordion(newActiveAccordion);
    }
    //newIconRotations[newActiveAccordion] = newIconRotations[newActiveAccordion] === "M9 1 5 5 1 1" ? "M9 5 5 1 1 5" : "M9 1 5 5 1 1";
    setIconRotations(newIconRotations);
  };

  return (
    <div id="accordion-collapse" data-accordion="collapse">
      {oneMACFAQContent.map((section:any , sectionIndex: number) => (
        <div key={sectionIndex}>
          <h2 className="topic-title">{section.sectionTitle}</h2>
          {section.qanda.map((qandaItem:any, qandaIndex:any) => (
            <div key={qandaIndex}>
              <h2 id={`accordion-collapse-heading-${sectionIndex}-${qandaIndex}`}>
                <button
                  type="button"
                  className="flex items-center justify-between w-full p-5 font-medium text-left accordion-button-new "
                  onClick={() => handleAccordionToggle(sectionIndex, qandaIndex)}
                  aria-expanded={activeAccordion === `${sectionIndex}-${qandaIndex}`}
                  aria-controls={`accordion-collapse-body-${sectionIndex}-${qandaIndex}`}
                >
                  <span>{qandaItem.question}</span>
                  <svg
                    data-accordion-icon
                    className={`w-3 h-3 rotate-180 shrink-0`}
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d={iconRotations[`${sectionIndex}-${qandaIndex}`] || "M9 5 5 1 1 5"}

                    />
                  </svg>
                </button>
              </h2>
              <div
                id={`accordion-collapse-body-${sectionIndex}-${qandaIndex}`}
                className={`${
                  activeAccordion === `${sectionIndex}-${qandaIndex}` ? '' : 'hidden'
                }`}
                aria-labelledby={`accordion-collapse-heading-${sectionIndex}-${qandaIndex}`}
              >
                <div className="p-5 border border-b-0 border-gray-200 dark:border-gray-700">
                  {qandaItem.answerJSX}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};



  const infoDetails = [
    {
      label: "Phone Number",
      linkType: "phone",
      infoValue: helpDeskContact.phone,
    },
    { label: "Email", linkType: "mailto", infoValue: helpDeskContact.email },
  ];

  const FaqInfo = () => {
    return (
      <dl>
        {infoDetails.map((detail, i) => (
          <div key={i} className="faq-info-wrapper">
            <dt>{detail.label}</dt>
            <dd>
              <a href={`${detail.linkType}:${detail.infoValue}`}>
                {detail.infoValue}
              </a>
            </dd>
          </div>
        ))}
      </dl>
    );
  };

  return (
    <div>
      <PageTitleBar heading="Frequently Asked Questions" />
      <div className="form-container" id="top">
        <div className="faq-card">
          <aside id="faq-contact-info-box">
            <div className="faq-border-box"></div>
            <div className="faq-info-box">
              <h2>OneMAC Help Desk Contact Info</h2>
              <FaqInfo/>
            </div>
          </aside>
          <div className="faq-left-column">
           
           <> <FAQAccordion/> </>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
