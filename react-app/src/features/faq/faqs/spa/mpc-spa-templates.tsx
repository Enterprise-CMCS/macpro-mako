import { PdfList, Template } from "../utils";

export const MPC_TEMPLATES: Template[] = [
  {
    title: "Premiums and Cost Sharing Public Notice and General Information",
    href: "/mpc/P&CSPN&GI.pdf",
  },
  {
    title: "G 1",
    text: "Cost Sharing Requirements",
    href: "/mpc/G1.pdf",
  },
  {
    title: "G 2a",
    text: "Cost Sharing Amounts - Categorically Needy",
    href: "/mpc/G2a.pdf",
  },
  {
    title: "G 2b",
    text: "Cost Sharing Amounts - Medically Needy",
    href: "/mpc/G2b.pdf",
  },
  {
    title: "G 2c",
    text: "Cost Sharing Amounts - Targeting",
    href: "/mpc/G2c.pdf",
  },
  {
    title: "G 3",
    text: "Cost Sharing Limitations",
    href: "/mpc/G3.pdf",
  },
];

export const MpcSpaTemplates = () => (
  <section className="space-y-2">
    <p>
      Medicaid Premiums and Cost Sharing SPA templates can be downloaded at the links below. After
      downloading and completing the templates you need, upload them as part of the SPA submission.
      The template PDFs can only be opened using Adobe Reader or Acrobat.
    </p>
    <PdfList list={MPC_TEMPLATES} label="template" />
  </section>
);
