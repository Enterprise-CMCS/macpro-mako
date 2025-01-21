import { TempExtCMSEmail } from "../../../content/tempExtension/emailTemplates/TempExtCMS";
import { emailTemplateValue } from "../../../mock-data/temp-extension";

const TempExtCMSPreview = () => {
  return (
    <TempExtCMSEmail
      variables={
        {
          ...emailTemplateValue,
          authority: "1915(b)",
          actionType: "Extend",
          emails: {
            osgEmail: ["someone at osg <osg@example.com>"],
          },
        } as any
      }
    />
  );
};

export default TempExtCMSPreview;
