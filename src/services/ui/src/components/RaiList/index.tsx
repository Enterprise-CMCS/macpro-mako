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
import { BLANK_VALUE } from "@/consts";

export const RaiList = (data: OsMainSourceItem) => {
  if (!data.rais) return null;
  return (
    <DetailsSection id="rai-responses" title="Formal RAI Activity">
      {Object.keys(data.rais).length > 0 ? (
        (() => {
          const sortedKeys = Object.keys(data.rais)
            .map(Number)
            .sort((a, b) => b - a);
          return (
            <div>
              {sortedKeys.map((key, i) => (
                <Accordion key={i} type="multiple" defaultValue={[]}>
                  <AccordionItem value={`item-${i}`}>
                    <AccordionTrigger>{`RAI #${
                      Object.keys(data.rais).length - i
                    } - ${getLatestStatus(data.rais[key])}`}</AccordionTrigger>
                    <AccordionContent>
                      <div className="ml-8">
                        <h3 className="text-xl font-semibold mb-2">
                          CMS Request Info
                        </h3>
                        {data.rais[key].requestedDate ? ( // if has data
                          <>
                            <h4 className="text-l font-semibold mb-2 ml-4">
                              Submitted Time:
                            </h4>
                            <p className="mb-4 text-sm ml-8">
                              {format(
                                new Date(data.rais[key].requestedDate),
                                "EEE, MMM d yyyy, h:mm:ss a"
                              )}
                            </p>
                            <h4 className="text-l font-semibold mb-2 ml-4">
                              Submitted By:
                            </h4>
                            <p className="mb-4 text-sm ml-8">
                              {data.rais[key].request?.submitterName ||
                                BLANK_VALUE}
                            </p>
                            <p className="text-l font-semibold mb-2 ml-4 ">
                              Attachments
                            </p>
                            {data.rais[key].request?.attachments ? (
                              <div className="ml-4">
                                <Attachmentslist
                                  id={data.id}
                                  attachments={
                                    data.rais[key].request.attachments
                                  }
                                />
                              </div>
                            ) : (
                              <p className="ml-8">{BLANK_VALUE}</p>
                            )}
                            <h4 className="text-l font-semibold mb-2 ml-4">
                              Additional Information
                            </h4>
                            <p className="mb-4 text-sm ml-8">
                              {data.rais[key].request?.additionalInformation ??
                                BLANK_VALUE}
                            </p>
                          </>
                        ) : (
                          <p className="ml-4">No Request Recorded</p>
                        )}
                      </div>
                      <div className="ml-8">
                        <h3 className="text-xl font-semibold mb-2">
                          State Response Info
                        </h3>
                        {data.rais[key].receivedDate ? ( // if has data
                          <>
                            <h4 className="text-l font-semibold mb-2 ml-4">
                              Submitted Time:
                            </h4>
                            <p className="mb-4 text-sm ml-8">
                              {format(
                                new Date(data.rais[key].receivedDate || ""), // idky its complaining, because
                                "EEE, MMM d yyyy, h:mm:ss a"
                              )}
                            </p>
                            <h4 className="text-l font-semibold mb-2 ml-4">
                              Submitted By:
                            </h4>
                            <p className="mb-4 text-sm ml-8">
                              {data.rais[key].response?.submitterName ||
                                BLANK_VALUE}
                            </p>
                            <p className="text-l font-semibold mb-2 ml-4 ">
                              Attachments
                            </p>
                            {data.rais[key].response?.attachments ? (
                              <div className="ml-4">
                                <Attachmentslist
                                  id={data.id}
                                  attachments={
                                    data.rais[key].response?.attachments || [] // idky it's making me do this?  do i need to check that attachmetns exists and its not null?
                                  }
                                />
                              </div>
                            ) : (
                              <p className="ml-4">{BLANK_VALUE}</p>
                            )}
                            <h4 className="text-l font-semibold mb-2 ml-4">
                              Additional Information
                            </h4>
                            <p className="mb-4 text-sm ml-8">
                              {data.rais[key].response?.additionalInformation ??
                                BLANK_VALUE}
                            </p>
                          </>
                        ) : (
                          <p className="ml-4">No Response Recorded</p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </div>
          );
        })()
      ) : (
        <p>{BLANK_VALUE}</p>
      )}
    </DetailsSection>
  );
};

function getLatestStatus(rai: any) {
  const { receivedDate, requestedDate, withdrawnDate } = rai;

  // Filter out null and undefined values and handle the case when all dates are null or undefined
  const filteredNumbers: number[] = [
    requestedDate,
    receivedDate,
    withdrawnDate,
  ].filter((num) => num !== null && num !== undefined) as number[];

  if (filteredNumbers.length === 0) {
    return "No date recorded";
  }

  const latestDate = Math.max(...filteredNumbers);
  let retString = "";

  if (latestDate === receivedDate) {
    retString += "Responded:";
  } else if (latestDate === requestedDate) {
    retString += "Requested:";
  } else if (latestDate === withdrawnDate) {
    retString += "Withdrawn:";
  }

  // Check if latestDate is a valid number before formatting
  if (!isNaN(latestDate) && isFinite(latestDate)) {
    return `${retString} ${format(
      new Date(latestDate),
      "EEE, MMM d yyyy, h:mm a"
    )}`;
  } else {
    return "Invalid date";
  }
}
