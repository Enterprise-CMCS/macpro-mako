import { Accordion, AccordionGroup } from "@enterprise-cmcs/macpro-ux-lib";
import { helpDeskContact, oneMACFAQContent } from "./content/oneMACFAQContent";
import { CardWithTopBorder } from "@/components";

export const Faq = () => {
  return (
    <>
      <div className="bg-sky-100">
        <div className="tw-max-w-screen-xl tw-m-auto tw-px-4 lg:tw-px-8">
          <div className="tw-flex tw-items-center">
            <div className="tw-flex tw-align-middle tw-py-4">
              <h1 className="tw-text-xl tw-font-medium">
                Frequently Asked Questions
              </h1>
            </div>
          </div>
        </div>
      </div>
      <section className="tw-block md:tw-flex md:tw-flex-row tw-max-w-screen-xl tw-m-auto tw-px-4 lg:tw-px-8 tw-pt-8 tw-gap-10">
        <div className="tw-flex-1">
          {oneMACFAQContent.map(({ sectionTitle, qanda }) => (
            <article key={sectionTitle} className="tw-mb-8">
              <h2 className="tw-text-2xl tw-mb-4 text-accent">
                {sectionTitle}
              </h2>
              {qanda.map(({ anchorText, answerJSX, question }) => (
                <AccordionGroup key={anchorText}>
                  <Accordion tw-hidden id="accordion-1" label={question}>
                    {answerJSX}
                  </Accordion>
                </AccordionGroup>
              ))}
            </article>
          ))}
        </div>
        <div>
          <CardWithTopBorder>
            <>
              <h3 className="tw-text-lg text-bold tw-mb-4">
                OneMAC Help Desk Contact Info
              </h3>
              <div>
                <b>Phone Number</b>
                <p className="tw-mb-4 tw-text-blue-700">
                  <a href={`tel:${helpDeskContact.phone}`}>
                    {helpDeskContact.phone}
                  </a>
                </p>
                <b>Email</b>
                <p className="tw-text-blue-700">
                  <a href={`mailto:${helpDeskContact.email}`}>
                    {helpDeskContact.email}
                  </a>
                </p>
              </div>
            </>
          </CardWithTopBorder>
        </div>
      </section>
    </>
  );
};
