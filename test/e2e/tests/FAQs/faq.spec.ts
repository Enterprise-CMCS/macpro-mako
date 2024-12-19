import { test, expect } from '@playwright/test';

import { FAQPage } from 'pages/faq.page';
let faqPage: FAQPage;

test.describe('FAQ page', {tag: ["@e2e", "@smoke", "@faq"]}, () => {
  test.beforeEach(async ({ page }) => {
    faqPage = new FAQPage(page);
    await page.goto('/faq');
  });

  test.describe("UI validation", {tag: ["@CI"]}, () => {
    test.describe("header", () => {
      test("displays header", async() => {
        await expect(faqPage.header).toBeVisible();
        await expect(faqPage.header).toHaveText("Frequently Asked Questions");
      });
    });
    
    test.describe("General section", () => {
      test("displays system for state submission FAQ", async() => {
        await expect(faqPage.crossWalk).toBeVisible();
        await expect(faqPage.crossWalk).toHaveText("Which system should I use for my state’s submission?");
    
        await expect(faqPage.pdfs.statePlans).not.toBeVisible();
      });

      test("displays browser type FAQ", async() => {
        await expect(faqPage.browsers).toBeVisible();
        await expect(faqPage.browsers).toHaveText("What browsers can I use to access the system?");
    
        await expect(faqPage.browsers.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays confirmation email FAQ", async() => {
        await expect(faqPage.confirmEmail).toBeVisible();
        await expect(faqPage.confirmEmail).toHaveText("What should we do if we don’t receive a confirmation email?");
    
        await expect(faqPage.confirmEmail.locator("div:nth-child(1)")).not.toBeVisible()
      });

      test("displays official submission FAQ", async() => {
        await expect(faqPage.official).toBeVisible();
        await expect(faqPage.official).toHaveText("Is this considered the official state submission?");

        await expect(faqPage.official.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays OneMac user roles FAQ", async() => {
        await expect(faqPage.onemacRoles).toBeVisible();
        await expect(faqPage.onemacRoles).toHaveText("What are the OneMAC user roles?");

        await expect(faqPage.onemacRoles.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays file format FAQ", async() => {
        await expect(faqPage.fileFormats).toBeVisible();
        await expect(faqPage.fileFormats).toHaveText("What are the kinds of file formats I can upload into OneMAC");

        await expect(faqPage.fileFormats.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays onboarding materials FAQ", async() => {
        await expect(faqPage.onboardingMaterials).toBeVisible();
        await expect(faqPage.onboardingMaterials).toHaveText("Onboarding Materials");

        await expect(faqPage.onboardingMaterials.locator("div:nth-child(1)")).not.toBeVisible();
      });
    });

    test.describe("State Plan Amendments (SPAs)", () => {
      test("displays format used to enter a SPA ID FAQ", async() => {
        await expect(faqPage.spaIdFormat).toBeVisible();
        await expect(faqPage.spaIdFormat).toHaveText("What format is used to enter a SPA ID?");
    
        await expect(faqPage.spaIdFormat.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays Medicaid SPA attachments FAQ", async() => {
        await expect(faqPage.medicaidSpaAttachments).toBeVisible();
        await expect(faqPage.medicaidSpaAttachments).toHaveText("What are the attachments for a Medicaid SPA?");
    
        await expect(faqPage.medicaidSpaAttachments.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays attachments response to Medicaid RAI FAQ", async() => {
        await expect(faqPage.medicaidSpaRai).toBeVisible();
        await expect(faqPage.medicaidSpaRai).toHaveText("What are the attachments for a Medicaid response to Request for Additional Information (RAI)?");
    
        await expect(faqPage.medicaidSpaRai.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays CHIP SPA attachments FAQ", async() => {
        await expect(faqPage.chipSpaAttachments).toBeVisible();
        await expect(faqPage.chipSpaAttachments).toHaveText("What are the attachments for a CHIP SPA?");
    
        await expect(faqPage.chipSpaAttachments.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays attachments response to CHIP RAI FAQ", async() => {
        await expect(faqPage.chipSpaRai).toBeVisible();
        await expect(faqPage.chipSpaRai).toHaveText("What are the attachments for a CHIP SPA response to Request for Additional Information (RAI)?");
    
        await expect(faqPage.chipSpaRai.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays PHE FAQ", async() => {
        await expect(faqPage.publicHealthEmergency).toBeVisible();
        await expect(faqPage.publicHealthEmergency).toHaveText("Can I submit SPAs relating to the Public Health Emergency (PHE) in OneMAC?");
    
        await expect(faqPage.publicHealthEmergency.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays withdraw formal RAI for Medicaid SPA FAQ", async() => {
        await expect(faqPage.withdrawSpaRai).toBeVisible();
        await expect(faqPage.withdrawSpaRai).toHaveText("How do I Withdraw a Formal RAI Response for a Medicaid SPA?");
    
        await expect(faqPage.withdrawSpaRai.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays withdraw package for Medicaid SPA FAQ", async() => {
        await expect(faqPage.withdrawPackageSpa).toBeVisible();
        await expect(faqPage.withdrawPackageSpa).toHaveText("How do I Withdraw a Package for a Medicaid SPA?");
    
        await expect(faqPage.withdrawPackageSpa.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays withdraw formal RAI for CHIP SPA FAQ", async() => {
        await expect(faqPage.withdrawChipSpaRai).toBeVisible();
        await expect(faqPage.withdrawChipSpaRai).toHaveText("How do I Withdraw a Formal RAI Response for a CHIP SPA?");
    
        await expect(faqPage.withdrawChipSpaRai.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays withdraw package for CHIP SPA FAQ", async() => {
        await expect(faqPage.withdrawPackageChipSpa).toBeVisible();
        await expect(faqPage.withdrawPackageChipSpa).toHaveText("How do I Withdraw a Package for a CHIP SPA?");
    
        await expect(faqPage.withdrawPackageChipSpa.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays download ABP SPA templates FAQ", async() => {
        await expect(faqPage.abpSpaTemplates).toBeVisible();
        await expect(faqPage.abpSpaTemplates).toHaveText("Where can I download Medicaid Alternative Benefit Plan (ABP) SPA templates?");
    
        await expect(faqPage.abpSpaTemplates.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays download ABP SPA implementation guides FAQ", async() => {
        await expect(faqPage.abpSpaGuides).toBeVisible();
        await expect(faqPage.abpSpaGuides).toHaveText("Where can I download Medicaid Alternative Benefit Plan (ABP) SPA implementation guides?");
    
        await expect(faqPage.abpSpaGuides.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays download MPC SPA templates FAQ", async() => {
        await expect(faqPage.mpcSpaTemplates).toBeVisible();
        await expect(faqPage.mpcSpaTemplates).toHaveText("Where can I download Medicaid Premiums and Cost Sharing (MPC) SPA templates?");
    
        await expect(faqPage.mpcSpaTemplates.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays download MPC SPA implementation guides FAQ", async() => {
        await expect(faqPage.mpcSpaGuides).toBeVisible();
        await expect(faqPage.mpcSpaGuides).toHaveText("Where can I download Medicaid Premiums and Cost Sharing (MPC) SPA implementation guides?");
    
        await expect(faqPage.mpcSpaGuides.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays download CHIP eligibility SPA templates FAQ", async() => {
        await expect(faqPage.chipSpaTemplates).toBeVisible();
        await expect(faqPage.chipSpaTemplates).toHaveText("Where can I download CHIP eligibility SPA templates?");
    
        await expect(faqPage.chipSpaTemplates.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays download CHIP eligibility SPA implementation guides FAQ", async() => {
        await expect(faqPage.chipSpaGuides).toBeVisible();
        await expect(faqPage.chipSpaGuides).toHaveText("Where can I download CHIP eligibility SPA implementation guides?");
    
        await expect(faqPage.chipSpaGuides.locator("div:nth-child(1)")).not.toBeVisible();
      });
    });

    test.describe("Waivers Section", () => {
      test("displays 1915(b) initial waiver number FAQ", async() => {
        await expect(faqPage.waiverIdFormat).toBeVisible();
        await expect(faqPage.waiverIdFormat).toHaveText("What format is used to enter a 1915(b) Initial Waiver number?");
    
        await expect(faqPage.waiverIdFormat.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays 1915(b) waiver renewal number FAQ", async() => {
        await expect(faqPage.waiverRenewalIdFormat).toBeVisible();
        await expect(faqPage.waiverRenewalIdFormat).toHaveText("What format is used to enter a 1915(b) Waiver Renewal number?");

        await expect(faqPage.waiverRenewalIdFormat.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays 1915(b) waiver amendment number FAQ", async() => {
        await expect(faqPage.waiverAmendmentIdFormat).toBeVisible();
        await expect(faqPage.waiverAmendmentIdFormat).toHaveText("What format is used to enter a 1915(b) Waiver Amendment number?");

        await expect(faqPage.waiverAmendmentIdFormat.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays contact help for 1915(b) waiver FAQ", async() => {
        await expect(faqPage.waiverIdHelp).toBeVisible();
        await expect(faqPage.waiverIdHelp).toHaveText("Who can I contact to help me figure out the correct 1915(b) Waiver Number?");

        await expect(faqPage.waiverIdHelp.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays format 1915(c) waiver number FAQ", async() => {
        await expect(faqPage.waiverCId).toBeVisible();
        await expect(faqPage.waiverCId).toHaveText("What format is used to enter a 1915(c) waiver number?");

        await expect(faqPage.waiverCId.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays attachments are needed for 1915(b) waiver action FAQ", async() => {
        await expect(faqPage.waiverBAttachments).toBeVisible();
        await expect(faqPage.waiverBAttachments).toHaveText("What attachments are needed to submit a 1915(b) waiver action?");

        await expect(faqPage.waiverBAttachments.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays attachments 1915b and c App K RAI response FAQ", async() => {
        await expect(faqPage.waiverBRaiAttachments).toBeVisible();
        await expect(faqPage.waiverBRaiAttachments).toHaveText("What are the attachments for a 1915(b) Waiver and 1915(c) Appendix K response to Request for Additional Information (RAI)?");

        await expect(faqPage.waiverBRaiAttachments.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays temporary extension format FAQ", async() => {
        await expect(faqPage.waiverExtensionIdFormat).toBeVisible();
        await expect(faqPage.waiverExtensionIdFormat).toHaveText("What format is used to enter a 1915(b) or 1915(c) Temporary Extension number?");

        await expect(faqPage.waiverExtensionIdFormat.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays status of my temporary extension FAQ", async() => {
        await expect(faqPage.waiverExtensionStatus).toBeVisible();
        await expect(faqPage.waiverExtensionStatus).toHaveText("Why does the status of my Temporary Extension Request continue to show as 'Submitted'?");

        await expect(faqPage.waiverExtensionStatus.locator("div:nth-child(1)")).not.toBeVisible();
      });

      // remove skip when selector is updated in application
      test.skip("displays attachments for 1915(b) waiver FAQ", async() => {
        await expect(faqPage.tempExtensionBAttachments).toBeVisible();
        await expect(faqPage.tempExtensionBAttachments).toHaveText("What are the attachments for a 1915(b) Waiver - Request for Temporary Extension?");

        await expect(faqPage.tempExtensionBAttachments.locator("div:nth-child(1)")).not.toBeVisible();
      });

      // remove skip when selector is updated in application
      test.skip("displays attachments for 1915(c) waiver FAQ", async() => {
        await expect(faqPage.tempExtensionCAttachments).toBeVisible();
        await expect(faqPage.tempExtensionCAttachments).toHaveText("What are the attachments for a 1915(c) Waiver - Request for Temporary Extension?");

        await expect(faqPage.tempExtensionCAttachments.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays submit App K attachments FAQ", async() => {
        await expect(faqPage.appK).toBeVisible();
        await expect(faqPage.appK).toHaveText("Can I submit Appendix K amendments in OneMAC?");

        await expect(faqPage.appK.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays attachments for 1915(c) Appendix K waiver FAQ", async() => {
        await expect(faqPage.appKAttachments).toBeVisible();
        await expect(faqPage.appKAttachments).toHaveText("What are the attachments for a 1915(c) Appendix K Waiver?");

        await expect(faqPage.appKAttachments.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays withdraw Formal RAI Response for Medicaid Waiver FAQ", async() => {
        await expect(faqPage.withdrawWaiverRai).toBeVisible();
        await expect(faqPage.withdrawWaiverRai).toHaveText("How do I Withdraw a Formal RAI Response for a Medicaid Waiver?");

        await expect(faqPage.withdrawWaiverRai.locator("div:nth-child(1)")).not.toBeVisible();
      });

      test("displays withdraw Package for Waiver FAQ", async() => {
        await expect(faqPage.withdrawPackageWaiver).toBeVisible();
        await expect(faqPage.withdrawPackageWaiver).toHaveText("How do I Withdraw a Package for a Waiver?");

        await expect(faqPage.withdrawPackageWaiver.locator("div:nth-child(1)")).not.toBeVisible();
      });
    });
  });

  test.describe("Interaction validation", () => {
    test.describe("General Section", () => {
      test("should display crosswalk system FAQ response", async() => {
        await faqPage.crossWalk.click();
        await expect(faqPage.pdfs.statePlans).toBeVisible();
      });
  
      test("should display browser FAQ response", async() => {
        await faqPage.browsers.click();
        await expect(faqPage.browsers.locator("div:nth-child(1)")).toBeVisible();
        // await expect(faqPage.browsers.locator("div:nth-child(1)")).toHaveText(""); Something TODO 
      });
  
      test("should display confirmation email FAQ response", async() => {
        await faqPage.confirmEmail.click();
        await expect(faqPage.confirmEmail.locator("div:nth-child(1)")).toBeVisible();
        // await expect(faqPage.confirmEmail.locator("div:nth-child(1)")).toHaveText(""); // Something TODO 
      });
  
      test("should display official submission FAQ response", async() => {
        await faqPage.official.click();
        await expect(faqPage.official.locator("div:nth-child(1)")).toBeVisible();
        // await expect(faqPage.official.locator("div:nth-child(1)")).toHaveText(""); TODO
      });
  
      test("should diplay OneMac User role FAQ response", async() => {
        await faqPage.onemacRoles.click();
        await expect(faqPage.onemacRoles.locator("div:nth-child(1)")).toBeVisible();
        // await expect(faqPage.onemacRoles.locator("div:nth-child(1)")).toHaveText(""); TODO
      });
  
      test("should display file formats FAQ response", async() => {
        await faqPage.fileFormats.click();
        await expect(faqPage.fileFormats.locator("div:nth-child(1)")).toBeVisible();
        // await expect(faqPage.fileFormats.locator("div:nth-child(1)")).toHaveText(""); TODO
      });
  
      test("should display the list on onboarding materials FAQ response", async() => {
        await faqPage.onboardingMaterials.click();
        await expect(faqPage.onboardingMaterials.locator("div:nth-child(1)")).toBeVisible();
        // await expect(faqPage.onboardingMaterials.locator("div:nth-child(1)")).toHaveText(""); TODO
        // TODO: assert on PDF HREFs
      });
    });

    test.describe("State Plan Amendments (SPAs) Section", () => {
      test("should display format used to enter a SPA ID FAQ response", async() => {
        await faqPage.spaIdFormat.click();
        await expect(faqPage.spaIdFormat.locator("div:nth-child(1)")).toBeVisible();
      });

      test("should display Medicaid SPA attachments FAQ response", async() => {
        await faqPage.medicaidSpaAttachments.click();
        await expect(faqPage.medicaidSpaAttachments.locator("div:nth-child(1)")).toBeVisible();
      });

      test("should display attachments response to Medicaid RAI FAQ response", async() => {
        await faqPage.medicaidSpaRai.click();
        await expect(faqPage.medicaidSpaRai.locator("div:nth-child(1)")).toBeVisible();
      });

      test("should display CHIP SPA attachments FAQ response", async() => {
        await faqPage.chipSpaAttachments.click();
        await expect(faqPage.chipSpaAttachments.locator("div:nth-child(1)")).toBeVisible();
      });

      test("should display attachments response to CHIP RAI FAQ response", async() => {
        await faqPage.chipSpaRai.click();
        await expect(faqPage.chipSpaRai.locator("div:nth-child(1)")).toBeVisible();
      });

      test("should display PHE FAQ response", async() => {
        await faqPage.publicHealthEmergency.click();
        await expect(faqPage.publicHealthEmergency.locator("div:nth-child(1)")).toBeVisible();
      });

      test("should display withdraw formal RAI for Medicaid SPA FAQ response", async() => {
        await faqPage.withdrawSpaRai.click();
        await expect(faqPage.withdrawSpaRai.locator('div[data-state="open"]')).toBeVisible();
      });

      test("should display withdraw package for Medicaid SPA FAQ response", async() => {
        await faqPage.withdrawPackageSpa.click();
        await expect(faqPage.withdrawPackageSpa.locator('div[data-state="open"]')).toBeVisible();
      });

      test("should display withdraw formal RAI for CHIP SPA FAQ response", async() => {
        await faqPage.withdrawChipSpaRai.click();
        await expect(faqPage.withdrawChipSpaRai.locator('div[data-state="open"]')).toBeVisible();
      });

      test("should display withdraw package for CHIP SPA FAQ response", async() => {
        await faqPage.withdrawPackageChipSpa.click();
        await expect(faqPage.withdrawPackageChipSpa.locator('div[data-state="open"]')).toBeVisible();
      });

      test("should display download ABP SPA templates FAQ response", async() => {
        await faqPage.abpSpaTemplates.click();
        await expect(faqPage.abpSpaTemplates.locator("div:nth-child(1)")).toBeVisible();
      });

      test("should display download ABP SPA implementation guides FAQ response", async() => {
        await faqPage.abpSpaGuides.click();
        await expect(faqPage.abpSpaGuides.locator("div:nth-child(1)")).toBeVisible();
      });

      test("should display download MPC SPA templates FAQ response", async() => {
        await faqPage.mpcSpaTemplates.click();
        await expect(faqPage.mpcSpaTemplates.locator("div:nth-child(1)")).toBeVisible();
      });

      test("should display download MPC SPA implementation guides FAQ response", async() => {
        await faqPage.mpcSpaGuides.click();
        await expect(faqPage.mpcSpaGuides.locator("div:nth-child(1)")).toBeVisible();
      });

      test("should display download CHIP eligibility SPA templates FAQ response", async() => {
        await faqPage.chipSpaTemplates.click();
        await expect(faqPage.chipSpaTemplates.locator("div:nth-child(1)")).toBeVisible();
      });

      test("should display download CHIP eligibility SPA implementation guides FAQ response", async() => {
        await faqPage.chipSpaGuides.click();
        await expect(faqPage.chipSpaGuides.locator("div:nth-child(1)")).toBeVisible();
      });
    });

    test.describe("Waivers Section", () => {
      test("displays 1915(b) initial waiver number FAQ response", async() => {
        await faqPage.waiverIdFormat.click();
        await expect(faqPage.waiverIdFormat.locator("div:nth-child(1)")).toBeVisible();
        // await expect(faqPage.waiverIdFormat.locator("div:nth-child(1)")).toHaveText(""); TODO
      });

      test("displays 1915(b) waiver renewal number FAQ response", async() => {
        await faqPage.waiverRenewalIdFormat.click();
        await expect(faqPage.waiverRenewalIdFormat.locator("div:nth-child(1)")).toBeVisible();
        // await expect(faqPage.waiverRenewalIdFormat.locator("div:nth-child(1)")).toHaveText(""); TODO
      });

      test("displays 1915(b) waiver amendment number FAQ response", async() => {
        await faqPage.waiverAmendmentIdFormat.click();
        await expect(faqPage.waiverAmendmentIdFormat.locator("div:nth-child(1)")).toBeVisible();
        // await expect(faqPage.waiverAmendmentIdFormat.locator("div:nth-child(1)")).toHaveText(""); TODO
      });

      test("displays contact help for 1915(b) waiver FAQ response", async() => {
        await faqPage.waiverIdHelp.click();
        await expect(faqPage.waiverIdHelp.locator("div:nth-child(1)")).toBeVisible();
        // await expect(faqPage.waiverIdHelp.locator("div:nth-child(1)")).toHaveText(""); TODO
      });

      test("displays format 1915(c) waiver number FAQ response", async() => {
        await faqPage.waiverCId.click();
        await expect(faqPage.waiverCId.locator("div:nth-child(1)")).toBeVisible();
        // await expect(faqPage.waiverCId.locator("div:nth-child(1)")).toHaveText(""); TODO
      });

      test("displays attachments are needed for 1915(b) waiver action FAQ response", async() => {
        await faqPage.waiverBAttachments.click();
        await expect(faqPage.waiverBAttachments.locator("div:nth-child(1)")).toBeVisible();
        // await expect(faqPage.waiverBAttachments.locator("div:nth-child(1)")).toHaveText(""); TODO
      });

      test("displays attachments 1915b and c App K RAI response FAQ response", async() => {
        await faqPage.waiverBRaiAttachments.click();
        await expect(faqPage.waiverBRaiAttachments.locator("div:nth-child(1)")).toBeVisible();
        // await expect(faqPage.waiverBRaiAttachments.locator("div:nth-child(1)")).toHaveText(""); TODO
      });

      test("displays temporary extension format FAQ response", async() => {
        await faqPage.waiverExtensionIdFormat.click();
        await expect(faqPage.waiverExtensionIdFormat.locator("div:nth-child(1)")).toBeVisible();
        // await expect(faqPage.waiverExtensionIdFormat.locator("div:nth-child(1)")).toHaveText(""); TODO
      });

      test("displays status of my temporary extension FAQ response", async() => {
        await faqPage.waiverExtensionStatus.click();
        await expect(faqPage.waiverExtensionStatus.locator("div:nth-child(1)")).toBeVisible();
      });

      // remove skip when selector is updated in application
      test.skip("displays attachments for 1915(b) waiver FAQ response", async() => {
        await faqPage.tempExtensionBAttachments.click();
        await expect(faqPage.tempExtensionBAttachments.locator("div:nth-child(1)")).toBeVisible();
        // await expect(faqPage.tempExtensionBAttachments.locator("div:nth-child(1)")).toHaveText(""); TODO
      });

      // remove skip when selector us updated in application
      test.skip("displays attachments for 1915(c) waiver FAQ response", async() => {
        await faqPage.tempExtensionCAttachments.click();
        await expect(faqPage.tempExtensionCAttachments.locator("div:nth-child(1)")).toBeVisible();
        // await expect(faqPage.tempExtensionCAttachments.locator("div:nth-child(1)")).toHaveText(""); TODO
      });

      test("displays submit App K attachments FAQ response", async() => {
        await faqPage.appK.click();
        await expect(faqPage.appK.locator("div:nth-child(1)")).toBeVisible();
        // await expect(faqPage.appK.locator("div:nth-child(1)")).toHaveText(""); TODO
      });

      test("displays attachments for 1915(c) Appendix K waiver FAQ response", async() => {
        await faqPage.appKAttachments.click();
        await expect(faqPage.appKAttachments.locator("div:nth-child(1)")).toBeVisible();
        // await expect(faqPage.appKAttachments.locator("div:nth-child(1)")).toHaveText(""); TODO
      });

      test("displays withdraw Formal RAI Response for Medicaid Waiver FAQ response", async() => {
        await faqPage.withdrawWaiverRai.click();
        await expect(faqPage.withdrawWaiverRai.locator('div[data-state="open"]')).toBeVisible();
        // await expect(faqPage.withdrawWaiverRai.locator("div:nth-child(1)")).toHaveText(""); TODO
      });

      test("displays withdraw Package for Waiver FAQ response", async() => {
        await faqPage.withdrawPackageWaiver.click();
        await expect(faqPage.withdrawPackageWaiver.locator('div[data-state="open"]')).toBeVisible();
        // await expect(faqPage.withdrawPackageWaiver.locator("div:nth-child(1)")).toHaveText(""); TODO
      });
    });
  });
});