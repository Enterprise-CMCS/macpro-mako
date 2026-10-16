import { type Locator, type Page } from "@playwright/test";

export class FAQPage {
  readonly page: Page;
  readonly header: Locator;
  readonly crossWalk: Locator;
  readonly browsers: Locator;
  readonly confirmEmail: Locator;
  readonly official: Locator;
  readonly onemacRoles: Locator;
  readonly fileFormats: Locator;
  readonly onboardingMaterials: Locator;

  readonly pdfs: Record<string, Locator>;

  readonly spaIdFormat: Locator;
  readonly medicaidSpaAttachments: Locator;
  readonly medicaidSpaRai: Locator;
  readonly chipSpaAttachments: Locator;
  readonly chipSpaRai: Locator;
  readonly publicHealthEmergency: Locator;
  readonly withdrawSpaRai: Locator;
  readonly withdrawPackageSpa: Locator;
  readonly withdrawChipSpaRai: Locator;
  readonly withdrawPackageChipSpa: Locator;
  readonly abpSpaTemplates: Locator;
  readonly abpSpaGuides: Locator;
  readonly mpcSpaTemplates: Locator;
  readonly mpcSpaGuides: Locator;
  readonly chipSpaTemplates: Locator;
  readonly chipSpaGuides: Locator;

  readonly waiverIdFormat: Locator;
  readonly waiverRenewalIdFormat: Locator;
  readonly waiverAmendmentIdFormat: Locator;
  readonly waiverIdHelp: Locator;
  readonly waiverCId: Locator;
  readonly waiverBAttachments: Locator;
  readonly waiverBRaiAttachments: Locator;
  readonly waiverExtensionIdFormat: Locator;
  readonly waiverExtensionStatus: Locator;
  readonly tempExtensionBAttachments: Locator;
  readonly tempExtensionCAttachments: Locator;
  readonly appK: Locator;
  readonly appKAttachments: Locator;
  readonly withdrawWaiverRai: Locator;
  readonly withdrawPackageWaiver: Locator;

  constructor(page: Page) {
    this.page = page;

    this.header = page.getByTestId("sub-nav-header");
    this.crossWalk = page.locator("#crosswalk-system");
    this.browsers = page.locator("#browsers");
    this.confirmEmail = page.locator("#confirm-email");
    this.official = page.locator("#is-official");
    this.onemacRoles = page.locator("#onemac-roles");
    this.fileFormats = page.locator("#acceptable-file-formats");
    this.onboardingMaterials = page.locator("#onboarding-materials");

    this.spaIdFormat = page.locator("#spa-id-format");
    this.medicaidSpaAttachments = page.locator("#medicaid-spa-attachments");
    this.medicaidSpaRai = page.locator("#medicaid-spa-rai-attachments");
    this.chipSpaAttachments = page.locator("#chip-spa-attachments");
    this.chipSpaRai = page.locator("#chip-spa-rai-attachments");
    this.publicHealthEmergency = page.locator("#public-health-emergency");
    this.withdrawSpaRai = page.locator("#withdraw-spa-rai-response");
    this.withdrawPackageSpa = page.locator("#withdraw-package-spa");
    this.withdrawChipSpaRai = page.locator("#withdraw-chip-spa-rai-response");
    this.withdrawPackageChipSpa = page.locator("#withdraw-package-chip-spa");
    this.abpSpaTemplates = page.locator("#abp-spa-templates");
    this.abpSpaGuides = page.locator("#abp-implementation-guides-spa");
    this.mpcSpaTemplates = page.locator("#mpc-spa-templates");
    this.mpcSpaGuides = page.locator("#mpc-spa-implementation-guides");
    this.chipSpaTemplates = page.locator("#chip-spa-templates");
    this.chipSpaGuides = page.locator("#chip-spa-implentation-guides");

    this.waiverIdFormat = page.locator("#initial-waiver-id-format");
    this.waiverRenewalIdFormat = page.locator("#waiver-renewal-id-format");
    this.waiverAmendmentIdFormat = page.locator("#waiver-amendment-id-format");
    this.waiverIdHelp = page.locator("#waiver-id-help");
    this.waiverCId = page.locator("#waiver-c-id");
    this.waiverBAttachments = page.locator("#waiverb-attachments");
    this.waiverBRaiAttachments = page.locator("#waiverb-rai-attachments");
    this.waiverExtensionIdFormat = page.locator("#waiver-extension-id-format");
    this.waiverExtensionStatus = page.locator("#waiver-extension-status");
    this.tempExtensionBAttachments = page.locator("#temporary-extensions-b-attachments");
    this.tempExtensionCAttachments = page.locator("#temporary-extensions-c-attachments");
    this.appK = page.locator("#appk");
    this.appKAttachments = page.locator("#appk-attachments");
    this.withdrawWaiverRai = page.locator("#withdraw-waiver-rai-response");
    this.withdrawPackageWaiver = page.locator("#withdraw-package-waiver");

    // HREFs of PDFs
    this.pdfs = {
      statePlans: page.locator('a[href*="state-plan-macpro"]'),
    };
  }
}
