import { OsMainSourceItem } from "shared-types";
import { DetailsSection } from "../DetailsSection";
import { format } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Attachmentslist,
} from "@/components";

export const RaiResponses = (data: OsMainSourceItem) => {
  if (!data.raiResponses || data.raiResponses.length === 0) return null;
  return (
    data.raiResponses && (
      <DetailsSection id="rai-responses" title="Formal RAI Responses">
        {data.raiResponses.map((R, i) => {
          return (
            <Accordion
              key={R.submissionTimestamp}
              type="multiple"
              defaultValue={["item-0"]}
            >
              <AccordionItem value={`item-${i}`}>
                <AccordionTrigger>{`Submitted on ${format(
                  new Date(R.submissionTimestamp),
                  "EEE, MMM d yyyy, h:mm:ss a"
                )}`}</AccordionTrigger>
                <AccordionContent>
                  <div className="ml-8">
                    <h3 className="text-l font-semibold mb-2">
                      RAI Response Documentation
                    </h3>
                    <p className="mb-4 text-sm">
                      Documents available on this page may not reflect the
                      actual documents that were approved by CMS. Please refer
                      to your CMS Point of Contact for the approved documents.
                    </p>
                    <Attachmentslist id={data.id} attachments={R.attachments} />
                    <h4 className="text-l font-semibold mb-2">
                      Additional Information
                    </h4>
                    <p className="mb-4 text-sm">{R.additionalInformation}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        })}
      </DetailsSection>
    )
  );
};
