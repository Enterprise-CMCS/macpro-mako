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

export const RaiList = (data: OsMainSourceItem) => {
  if (!data.rais) return null;
  return (
    <DetailsSection id="rai-responses" title="Formal RAI Activity">
      {(() => {
        const sortedKeys = Object.keys(data.rais) // Sort the RAIs by timestamp
          .map(Number)
          .sort((a, b) => b - a);
        return (
          <div>
            {sortedKeys.map((key, i) => (
              <Accordion key={i} type="multiple" defaultValue={["item-0"]}>
                <AccordionItem value={`item-${i}`}>
                  <AccordionTrigger>{`Requested on ${
                    data.rais[key].requestedDate
                      ? format(
                          new Date(data.rais[key].requestedDate),
                          "EEE, MMM d yyyy, h:mm:ss a"
                        )
                      : "Unknown"
                  }`}</AccordionTrigger>
                  <AccordionContent>
                    <div className="ml-8">
                      <h3 className="text-xl font-semibold mb-2">
                        RAI - Request Documentation
                      </h3>
                      <p className="mb-4 text-sm">
                        Below is the data submitted by CMS as part of the formal
                        RAI.
                      </p>
                      <p className="text-l font-semibold mb-2">Attachments</p>
                      <Attachmentslist
                        id={data.id}
                        attachments={data.rais[key].request.attachments}
                      />
                      <h4 className="text-l font-semibold mb-2">
                        Additional Information
                      </h4>
                      <p className="mb-4 text-sm">
                        {data.rais[key].request.additionalInformation}
                      </p>
                    </div>
                    {/* <div className="ml-8">
                        <h3 className="text-xl font-semibold mb-2">
                          RAI - Response Documentation
                        </h3>
                        <p className="mb-4 text-sm">
                          Below is the data submitted by the state as part of
                          the formal RAI response.
                        </p>
                        <p className="text-l font-semibold mb-2">
                          Submitted Attachments
                        </p>
                        <Attachmentslist
                          id={data.id}
                          attachments={data.rais[key].response.attachments}
                        />
                        <h4 className="text-l font-semibold mb-2">
                          Additional Information
                        </h4>
                        <p className="mb-4 text-sm">
                          {data.rais[key].response.additionalInformation}
                        </p>
                      </div> */}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
        );
      })()}
    </DetailsSection>
  );
};
