import { Button, TD, TH, Table } from "@enterprise-cmcs/macpro-ux-lib";

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
          {data.attachments.map((attachment:any) => {
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
                      {/*we want to show the MM/dd/YYYY on line 1, and then the timestamp on line 2.  this data is missing from the attachments info tho, so i wont try to tee that up */}
                      {/* the timestamp can be inferred by the s3Key.. its an epoch... if we can rely on that, we should do that in the sink, not here */}
                      <p>{attachment.uploadDate}</p>
                    </div>
                  </TD>
                </tr>
            );
          })}
        </tbody>
      </Table>
      <div className="flex justify-end">
        <Button
          buttonText="Download All"
          buttonVariation="secondary"
          iconName="file_download"
          target="_self"
          type="button"
          style={{ padding: "4px" }}
        />
      </div>
    </div>
  );
};
