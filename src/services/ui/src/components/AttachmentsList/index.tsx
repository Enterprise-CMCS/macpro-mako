import { Button, TD, TH, Table } from "@enterprise-cmcs/macpro-ux-lib";

export const Attachmentslist = () => {
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
          <tr>
            <TH rowHeader>
              <p className="text-sm font-bold">CMS Form 197</p>
            </TH>
            <TD>
              <div className="text-sm">
                <button className="text-blue-600">long file name.pdf</button>
                <p>(ZIP, 1.2MB)</p>
              </div>
            </TD>
            <TD>
              <div className="text-slate-500 text-sm">
                <p>Jun 14, 2021</p>
                <p>10:30 AM EST </p>
              </div>
            </TD>
          </tr>
          <tr>
            <TH rowHeader>
              <p className="text-sm font-bold">SPA Pages</p>
            </TH>
            <TD>
              <div className="text-sm">
                <button className="text-blue-600">long file name.pdf</button>
                <p>(ZIP, 1.2MB)</p>
              </div>
            </TD>
            <TD>
              <div className="text-slate-500 text-sm">
                <p>Jun 14, 2021</p>
                <p>10:30 AM EST </p>
              </div>
            </TD>
          </tr>
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
