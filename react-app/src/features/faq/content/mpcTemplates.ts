import g1PDF from "@/assets/mpc/IG_G1_CostSharingRequirements.pdf";
import g2aPDF from "@/assets/mpc/IG_G2a_CostSharingAmountsCN.pdf";
import g2bPDF from "@/assets/mpc/IG_G2b_CostSharingAmountsMN.pdf";
import g2cPDF from "@/assets/mpc/IG_G2c_CostSharingAmountsTargeting.pdf";
import g3PDF from "@/assets/mpc/IG_G3_CostSharingLimitations.pdf";
import { Template } from "./chpRenderSection";

export const MPC_TEMPLATES: Template[] = [
  {
    title: "G 1",
    text: "Cost-Sharing Requirements",
    href: g1PDF,
  },
  {
    title: "G 2a",
    text: "Cost-Sharing Amounts - Categorically Needy",
    href: g2aPDF,
  },
  {
    title: "G 2b",
    text: "Cost-Sharing Amounts - Medically Needy",
    href: g2bPDF,
  },
  {
    title: "G 2c",
    text: "Cost-Sharing Amounts - Targeting",
    href: g2cPDF,
  },
  {
    title: "G 3",
    text: " Cost-Sharing Limitations",
    href: g3PDF,
  },
];
