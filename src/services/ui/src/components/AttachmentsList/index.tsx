import { Button, TD, TH, Table } from "@enterprise-cmcs/macpro-ux-lib";
import { format } from "date-fns";
export const Attachmentslist = (data:any) => {
  
  return (
    <div>
      <Table borderless className="w-full">
        <thead>
          <tr>
            <TH>Document Type</TH>
            <TH>Attached File</TH>
            <TH>Upload Date</TH>
          </tr>
        </thead>
        <tbody>
          {data.attachments?.map((attachment:any) => {
            return (
                <tr key={attachment.s3Key}>
                  <TH rowHeader>
                    <p className="text-sm font-bold">{attachment.title}</p>
                  </TH>
                  <TD>
                    <div className="text-sm">
                      <button className="text-blue-600">{attachment.filename}</button>
                      {/* originally wanted the size as well, but that data is missing*/}
                      <p>({attachment.contentType ? attachment.contentType.split("/").slice(-1) : "Unknown"})</p>
                    </div>
                  </TD>
                  <TD>
                    <div className="text-slate-500 text-sm">
                      {attachment.uploadDate? (
                        <>
                          <p>{format(attachment.uploadDate, "MM/dd/yyyy")}</p>
                          <p>{format(attachment.uploadDate, "h:mm a")}</p>
                        </>
                      ) : (
                        <p>Unknown</p>
                      )}
                    </div>
                  </TD>
                </tr>
            );
          })}
        </tbody>
      </Table>
      <div className="flex justify-end">
        { data.attachments? (
            <Button
            buttonText="Download All"
            buttonVariation="secondary"
            iconName="file_download"
            target="_self"
            type="button"
            style={{ padding: "4px" }}
          />) : (<></>) }
        
      </div>
    </div>
  );
};
