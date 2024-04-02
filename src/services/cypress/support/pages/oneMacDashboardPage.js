const newSubmissionBTN = '//*[contains(text(),"New Submission")]';;
const successMessage = "#alert-bar h2";
const successMessage1 = "#alert-bar";
const packageSubmittedMsg = '//h3';
//Element is Xpath use cy.xpath instead of cy.get
const successMessageAfterRAIResponse =
  '//*[contains(text(),"Your submission has been received.")]';
const dashboardBtn = "//nav[@class='bg-primary']//a[@href='/dashboard']";
//Element is Xpath use cy.xpath instead of cy.get
const IDNUMBER = (id) => `//a[text()="${id}"]`;
//Element is Xpath use cy.xpath instead of cy.get
//Element is Xpath use cy.xpath instead of cy.get
const Type = "//td[@id='type-0']";
const date = "#submittedAt-0";
//Element is Xpath use cy.xpath instead of cy.get
//Element is Xpath use cy.xpath instead of cy.get
//const respondToRAI = '//body/div[@id="simple-menu"]/div[3]/ul[1]/div[1]/li[1]';
const respondToRAI = '//li[(text()="Respond to RAI")]';
const userManagementTab = "#userManagementLink";
//Element is Xpath use cy.xpath instead of cy.get
const exportToEXcelCSVBTN = "//button//span[contains(text(),'Export')]";
//Element is Xpath use cy.xpath instead of cy.get
const logoutBtn = "//button[text()='Sign Out']";
const rcSuccessMessage = "#alert-bar";

//Element is Xpath use cy.xpath instead of cy.get
const nintieththDayColumn = '//th[@id="ninetiethDayColHeader"]';
const nintiethDayColumnFirstValue = "#ninetiethDay-0";
//Element is Xpath use cy.xpath instead of cy.get
const MD32560Value = (waiverNumber) =>
  `//a[contains(text(),"${waiverNumber}")]`;
//Element is Xpath use cy.xpath instead of cy.get
const WI232222MED1 = '//a[contains(text(),"WI-23-2222-MED1")]';
//Element is Xpath use cy.xpath instead of cy.get
const expirationDateColumnHeader = '//th[@id="expirationTimestampColHeader"]';
//Element is Xpath use cy.xpath instead of cy.get
const firstExperationDate = '//td[@id="expirationTimestamp-0"]';
//Element is Xpath use cy.xpath instead of cy.get
const MD32560hrefValue =
  '//a[contains(@href,"/detail/waivernew/1633642209858/MD.32560")]';
const searchbar = "#searchInput";
//Element is Xpath use cy.xpath instead of cy.get
const searchbarHeader = "//label[@for='searchInput']";
//Element is Xpath use cy.xpath instead of cy.get
const searchBarXBTN = "*[name='close']";
//Element is Xpath use cy.xpath instead of cy.get
const errorMessageForNoResultsFound =
  "//p[contains(text(),'Adjust your search and filter to find what you are')]";
const stateColumnHeader = "//th//*[text()='State']";
//Element is Xpath use cy.xpath instead of cy.get
const filterButton = "//button/span[contains(text(),'Filter')]";
const closeFilterBtn = "//button/span[contains(text(),'Close')]";
//Element is Xpath use cy.xpath instead of cy.get
const filterByText = "//h4[text()='Filters']";
//Element is Xpath use cy.xpath instead of cy.get
const closeButton = "//header/button[1]";
//Element is Xpath use cy.xpath instead of cy.get
const authorityDropDownFilter = "//button[text()='Authority']";
const finalDispositionDatePickerFilter = "#finalDispositionDate-date-filter";
const authorityDropDown = "//button[text()='Authority']";
const actionTypeDropDown = "//button[text()='Action Type']";
const statusDropDown = "//button[text()='Status']";
const cPOCNameDropDown = "#cpocName-button";
const finalDispositionDateFilterDropdown = "#finalDispositionDate-button";
const statusFilterCheckboxes = "#packageStatus input";
const typeFilterCheckboxes = "#componentType input";
//Element is Xpath use cy.xpath instead of cy.get
const formalRAIReceivedCheckbox =
  "//*[@data-state='open'][@role='dialog']//*[contains(text(),'Formal RAI Received')]";
const formalRAIResponseCheckbox = "//*[@data-state='open'][@role='dialog']//*[contains(text(),'Formal RAI Response')]";

//Element is Xpath use cy.xpath instead of cy.get
const initialSubmissionDateFilterDropdown =
  "//button[text()='Initial Submission']";
const dateDatePickerFilter =
  "#date";
const formalRAIReceivedDateFilterDropdown =
  "//button[text()='Formal RAI Received']";
const formalRAIReceivedDatePickerFilter =
  "#latestRaiResponseTimestamp-date-filter";
//Element is Xpath use cy.xpath instead of cy.get
const thisQuarterDatePickerBtn = "//button[contains(text(),'This Quarter')]";
//Element is Xpath use cy.xpath instead of cy.get
const quarterToDateDatePickerBtn =
  "//button[contains(text(),'Quarter To Date')]";
//Element is Xpath use cy.xpath instead of cy.get
const statusDropDownFilter = "//button[text()='Status']";
const packageRowOneInitialSubmissionDate = "tr:nth-of-type(1) > td:nth-of-type(6)";
const packageRowOneFormalRAIReceived = "#latestRaiResponseTimestamp-0";
//Element is Xpath use cy.xpath instead of cy.get
const resetButton = "//button[contains(text(),'Reset')]";
//Element is Xpath use cy.xpath instead of cy.get
const type1915bCheckBox =
  "//button[@id='1915(b)']";
const type1915cCheckBox =
  "//button[@id='1915(c)']";
const waiverRenewalFilterCheckBox =
  "//label[contains(@for,'Renewal')]";
const appendixKAmendmentCheckBox =
  "//label[contains(@for,'1915(c) Appendix K Amendment')]";
const waiverAmendmentFilterCheckbox =
  "//label[contains(@for,'Amendment')]";
const initialWaiverCheckBox =
  "//label[contains(@for,'Initial')]";
const temporaryExtension1915cCheckBox =
  "//label[contains(@for,'1915(c) Temporary Extension')]";
//Element is Xpath use cy.xpath instead of cy.get
const CHIPSPACheckBox =
  "//label[contains(@for,'CHIP SPA')]";
//Element is Xpath use cy.xpath instead of cy.get
const MedicaidSPACheckBox =
  "//label[contains(@for,'Medicaid SPA')]";
//Element is Xpath use cy.xpath instead of cy.get
const underReviewCheckBox =
  "//label[contains(@for,'Under Review')]";
//Element is Xpath use cy.xpath instead of cy.get
const withdrawalRequestedCheckBox =
  "//label[contains(@for,'Withdrawal Requested')]";
//Element is Xpath use cy.xpath instead of cy.get
const raiResponseWithdrawalRequestedCheckBox =
  "//label[contains(@for,'Formal RAI Response - Withdrawal Requested')]";
const checkboxfinalDispositionDate =
  "//span[contains(text(),'Final Disposition')]";
//Element is Xpath use cy.xpath instead of cy.get
const raiResponseWithdrawEnabledCheckBox =
  "//label[contains(@for,'RAI Response Withdraw Enabled')]";
const finalDispositionColumn = "#finalDispositionDateColHeader";
//Element is Xpath use cy.xpath instead of cy.get
const terminatedCheckBox =
  "//label[contains(@for,'Waiver Terminated')]";
//Element is Xpath use cy.xpath instead of cy.get
const withdrawnCheckBox =
  "//label[contains(@for,'Package Withdrawn')]";
//Element is Xpath use cy.xpath instead of cy.get
const raiResponseSubmitted = "//span[contains(text(),'RAIResponse Submitted')]";
//Element is Xpath use cy.xpath instead of cy.get
const seaToolStatus1 = "//span[contains(text(),'SEATool Status: 1')]";
//Element is Xpath use cy.xpath instead of cy.get
const ShowHideColumnsBTN = "//button//*[contains(text(),'Visibility Popover Icon')]";
//Element is Xpath use cy.xpath instead of cy.get
const checkBoxInitialSubmissionDate =
  "//*[@data-state='open'][@role='dialog']//*[contains(text(),'Initial Submission')]";
//Element is Xpath use cy.xpath instead of cy.get
const checkboxState = "//*[@data-state='open'][@role='dialog']//*[text()='State']";
//Element is Xpath use cy.xpath instead of cy.get
const checkBoxStatus = "//*[@data-state='open'][@role='dialog']//*[contains(text(),'Status')]";
//Element is Xpath use cy.xpath instead of cy.get
const checkBoxSubmittedBy = "//*[@data-state='open'][@role='dialog']//*[contains(text(),'Submitted By')]";
//Element is Xpath use cy.xpath instead of cy.get
const checkBoxAuthority = "//*[@data-state='open'][@role='dialog']//*[text()='Authority']";
const checkBoxTypeAction = "//*[@data-state='open'][@role='dialog']//*[text()='Action Type']";
const checkboxCPOCName = "//*[@data-state='open'][@role='dialog']//*[contains(text(),'CPOC Name')]";
const IDNumberColumn = "//th//*[text()='SPA ID']";
const WaiverNumberColumn = "//th//*[text()='Waiver Number']";
const authorityColumn = "//th//*[text()='Authority']";
const actionTypeColumn = "//th//*[text()='Action Type']";
const statusColumn = "//th//*[text()='Status']";
const initialSubmissionDateColumn = "//th//*[text()='Initial Submission']";
const submittedByColumn = "//th//*[text()='Submitted By']";
const actionsColumn = "//th//*[text()='Actions']";
const formalRAIResponseColumn = "//th//*[text()='Formal RAI Response']";
const formalRAIReceivedColumn = "//th//*[text()='Formal RAI Received']";
const cPOCNameColumn = "//th//*[text()='CPOC Name']";
const packageRowOneType = "//tbody/tr[2]/td[1]";
const packageRowOneTypeAction = "//tbody/tr[1]/td[5]";
const packageRowOneState = "tr:nth-of-type(1) > td:nth-of-type(3)";
//first obj is a header and second obj is row if there are results
const packageRows = "tr";
const packageRowOne = "tbody > tr:nth-child(1)";
//Element is Xpath use cy.xpath instead of cy.get
const Approved =
  "//a[contains(text(),'MD-12-8214')]/../following-sibling::td[7]/div";
//Element is Xpath use cy.xpath instead of cy.get
const Disapproved =
  "//a[contains(text(),'MD-45-5913')]/../following-sibling::td[7]/button";
//Element is Xpath use cy.xpath instead of cy.get
const PackageWithdrawn =
  "//a[contains(text(),'MD-13-8218')]/../following-sibling::td[7]/div";
//Element is Xpath use cy.xpath instead of cy.get
const waiverTerminated =
  "//a[text()='MD.10330']/../following-sibling::td[contains(@id,'packageActions')]/button";
//Element is Xpath use cy.xpath instead of cy.get
const Unsubmitted =
  "//a[contains(text(),'MD.83420')]/../following-sibling::td[contains(@id,'packageActions')]/button";
const stateDropdownFilter = "//button[text()='State']";
const filterInput = "//*[@data-state='open']//input";
const statesSelected = "#territory";
//Element is Xpath use cy.xpath instead of cy.get
const removeBtn = (state) => `//*[@aria-label='Remove ${state}']`;
const waiversTab = "//button[contains(@id, 'trigger-waivers')]";
const spasTab = "//button[contains(@id, 'trigger-spas')]";
//Element is Xpath use cy.xpath instead of cy.get
const raiIssuedCheckbox =
  "//label[contains(@for,'RAI Issued')]";
const pendingRaiCheckbox =
  "//label[contains(@for,'Pending - RAI')]";
const pendingConcurrenceCheckbox =
  "//label[contains(@for,'Pending - Concurrence')]";
const pendingApprovalCheckbox =
  "//label[contains(@for,'Pending - Approval')]";
//Element is Xpath use cy.xpath instead of cy.get
const approvedCheckbox =
  "//label[contains(@for,'Approved')]";
//Element is Xpath use cy.xpath instead of cy.get
const disapprovedCheckbox =
  "//label[contains(@for,'Disapproved')]";
//Element is Xpath use cy.xpath instead of cy.get
const submittedCheckbox =
  "//label[contains(@for,'Submitted')]";
//Element is Xpath use cy.xpath instead of cy.get
const submittedIntakeNeededCheckbox =
  "//label[contains(@for,'Submitted - Intake Needed')]";
const doubleDashCheckbox =
  "//label[contains(@for,'Requested')]";
const pendingCheckbox =
  "//label[@for='Pending']";
const unsubmittedCheckbox =
  "//label[contains(@for,'Unsubmitted')]";
const packageRowTwoID = "#componentId-1";
const packageRowTwoStatus = "#packageStatus-1";
//Element is Xpath use cy.xpath instead of cy.get
const withdrawPackageBtn = "//a[text()='Withdraw Package']";
const withdrawPackageConfirmBtn =
  "//button[contains(text(),'Yes, withdraw package')]";
const withdrawResponseConfirmBtn =
  "//button[contains(text(),'Yes, withdraw response')]";
// const successMessage = "#alert-bar";
//Element is Xpath use cy.xpath instead of cy.get
const packageRowOneIDLink = "//tr[1]//a[contains(@href,'/details?id')]";
const packageRowOneActionsBtn = "//button[@aria-label='Available actions']";
const packageRowOneCPOC = "#cpocName-0";
const respondToRAIBtn =
  "//a[text()= 'Respond to Formal RAI']";
const issueRAIBtn = "//a[text()= 'Issue Formal RAI']";
const RequestTempExtensionBtn = "//a[text()='Request Temporary Extension']";
const addAmendmentBtn = "//a[text()='Add Amendment']";
const waiverNumLink = (n) => `//a[text()="${n}"]`;

export class oneMacDashboardPage {
  verifyPageByURL(expectedUrl) {
    cy.url().should("include", expectedUrl);
  }
  clickDashboardBtn() {
    cy.xpath(dashboardBtn).click();
  }
  clickNewSubmission() {
    cy.xpath(newSubmissionBTN).click();
  }
  verifySuccessMessageIs(s) {
    cy.get(successMessage).contains(s, { matchCase: false });
  }
  verifySuccessMessage1IsDisplayed() {
    cy.xpath(successMessage1).contains("Submission Completed", { matchCase: false });
  }
  verifyPackageSubmittedIsDisplayed() {
    cy.xpath(packageSubmittedMsg).contains("Package submitted", { matchCase: false });
  }
  verifyAlertMessageIs(s) {
    cy.xpath(packageSubmittedMsg).contains(s, { matchCase: false });
  }
  verifyIDNumber(s) {
    cy.xpath(IDNUMBER(s)).first().should("exist");
  }
  clickIDNumberLink(s) {
    cy.xpath(IDNUMBER(s)).click({ force: true });
  }
  verifyType(s) {
    cy.xpath(Type).contains(s);
  }
  verifyTypeForID(s, e) {
    cy.xpath(IDNUMBER(s)).parent().next("td").contains(e);
  }
  verifyDate() {
    cy.get(date).should("be.visible");
  }
  clickOnrespondToRAI(s) {
    cy.xpath(IDNUMBER(s)).parent().siblings().find("button").click();
    cy.xpath(respondToRAI).filter(":visible").click();
  }
  verifySPARAIIDNumberMatchesMedicalSPAIDNumber(s) {
    cy.xpath(IDNUMBER(s)).should("be.visible").and("have.length", 2);
  }
  verifySPARAIIDNumberMatchesCHIPSPAIDNumber(s) {
    cy.xpath(IDNUMBER(s)).should("be.visible").and("have.length", 2);
  }
  clickUserManagementTab() {
    cy.get(userManagementTab).click();
  }
  verifyWeAreOnDashboardPage() {
    cy.url().should("include", "/dashboard");
  }

  verifyexportToEXcelCSVBTNIsDisplayed() {
    cy.xpath(exportToEXcelCSVBTN).should("be.visible");
  }
  verifyNewSubmissionBTNIsDisplayed() {
    cy.xpath(newSubmissionBTN).should("be.visible");
  }
  verifyIDNumberIsDisplayed(s) {
    cy.xpath(IDNUMBER(s)).should("be.visible");
  }
  navigatetoURL(s) {
    cy.visit(s);
  }
  verifyLogoutBtnExists() {
    cy.xpath(logoutBtn).should("be.visible");
  }
  clickLogoutBtn() {
    cy.xpath(logoutBtn).click({ force: true });
  }
  verifySuccessMessageIsDisplayedForRoleChange() {
    cy.get(rcSuccessMessage).contains("Status Change");
  }
  verifyActionsBtnDisabledOnFirstRow() {
    cy.xpath(packageRowOneActionsBtn).should("be.disabled");
  }

  verify90thDayColumn() {
    cy.xpath(nintieththDayColumn).should("be.visible");
  }

  verifyValue() {
    cy.get(nintiethDayColumnFirstValue).contains(
      /N\/A|Pending|Clock Stopped|((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\s+(\d{4}))/
    );
  }

  findIdNumberMD32560(waiverNumber) {
    cy.xpath(MD32560Value(waiverNumber)).contains(waiverNumber);
  }

  findIdNumberWI232222MED1() {
    cy.xpath(WI232222MED1).contains("WI-23-2222-MED1");
  }

  verifyexpirationDateColumnHeaderExists() {
    cy.xpath(expirationDateColumnHeader).should("be.visible");
  }

  noResultsFoundErrorMessage() {
    cy.get("tbody").find(packageRows).first().should('contain', 'No Results Found');
  }

  typeCreatedIDNumber(s) {
    cy.get(searchbar).type(s + '{Enter}');
  }
  verifyIDNumberExists(s) {
    cy.xpath("//a[contains(text()," + s + ")]").should("be.visible");
  }
  clearSearchBar() {
    cy.get(searchbar).clear();
  }
  typeSubmittersName() {
    cy.get(searchbar).type("Angie Active {Enter}");
  }
  typeSubmittersNameAllUpperCase() {
    cy.get(searchbar).type("ANGIE ACTIVE {Enter}");
  }
  verifySearchBarExists() {
    cy.get(searchbar).should("be.visible");
  }
  verifySearchisDisplayed() {
    cy.xpath(searchbarHeader).contains(
      "Search by Package ID, CPOC Name, or Submitter Name"
    );
  }
  verifyxexistsandClickIt() {
    cy.get(searchBarXBTN).click();
  }
  verifyXExists() {
    cy.get(searchBarXBTN).should('be.visible');
  }
  verifyErrorMessageDetails() {
    cy.xpath(errorMessageForNoResultsFound).contains(
      "Adjust your search and filter to find what you are looking for."
    );
  }
  verifyStateColumnExists() {
    cy.xpath(stateColumnHeader).should("be.visible");
  }
  verifyStateColumnIsSortable() {
    cy.xpath(stateColumnHeader).find("svg");
  }
  verifyfilterButtonExists() {
    cy.xpath(filterButton).should("be.visible");
  }
  clickOnfilterButton() {
    cy.xpath(filterButton).click();
  }
  clickOnCloseFilterBtn() {
    cy.xpath(closeFilterBtn).click({ force: true });
    cy.wait(2000);
  }
  verifyfilterByExists() {
    cy.xpath(filterByText).should("be.visible");
  }
  verifycloseButtonExists() {
    cy.xpath(closeFilterBtn).parent("button").should("be.visible");
  }
  verifyAuthorityDropDownExists() {
    cy.xpath(authorityDropDown).should("be.visible");
  }
  verifyauthorityDropDownFilterExists() {
    cy.xpath(authorityDropDownFilter).should("be.visible");
  }
  verifyInitialSubmissionDateFilterDropDownExists() {
    cy.xpath(initialSubmissionDateFilterDropdown).should("be.visible");
  }
  clickOnInitialSubmissionDateFilterDropDown() {
    cy.xpath(initialSubmissionDateFilterDropdown).wait(1000);
    cy.xpath(initialSubmissionDateFilterDropdown).click();
  }
  verifyFormalRAIReceivedDateFilterDropdownExists() {
    cy.xpath(formalRAIReceivedDateFilterDropdown).should("be.visible");
  }
  clickOnFormalRAIReceivedDateFilterDropdownDropDown() {
    cy.xpath(formalRAIReceivedDateFilterDropdown).wait(1000);
    cy.xpath(formalRAIReceivedDateFilterDropdown).click();
  }
  verifyFormalRAIReceivedCheckboxExists() {
    cy.xpath(formalRAIReceivedCheckbox).should("exist");
  }
  verifyFormalRAIResponseCheckboxExists() {
    cy.xpath(formalRAIResponseCheckbox).should("exist");
  }
  clickFormalRAIReceivedVisibilityToggleBtn() {
    cy.xpath(formalRAIReceivedCheckbox).click();
  }
  verifyDatePickerFilterExists() {
    cy.get(dateDatePickerFilter).last().should("exist");
  }
  clickOnDatePickerFilter() {
    cy.get(dateDatePickerFilter).wait(1000);
    cy.get(dateDatePickerFilter).last().click();
  }
  clickOnThisQuarterDatePickerBtn() {
    cy.xpath(thisQuarterDatePickerBtn).click();
  }
  clickOnQuarterToDateDatePickerBtn() {
    cy.xpath(quarterToDateDatePickerBtn).click();
  }
  verifyPackageRowOneExists() {
    cy.get(packageRowOne).should("be.visible");
  }
  verifypackageRowOneInitialSubmissionDateIsThisQuarter() {
    cy.get(packageRowOneInitialSubmissionDate, { timeout: 15000 })
      .invoke("text")
      .then((dateText) => {
        const date = new Date(dateText);
        const today = new Date();
        let dateQuarter = Math.floor((date.getMonth() + 3) / 3);
        let todaysQuarter = Math.floor((today.getMonth() + 3) / 3);
        expect(dateQuarter).to.eq(todaysQuarter);
      });
  }
  verifystatusDropDownFilterExists() {
    cy.xpath(statusDropDownFilter).should("be.visible");
  }
  verifystatusDropDownExists() {
    cy.xpath(statusDropDown).should("be.visible");
  }
  verifyCPOCNameDropDownExists() {
    cy.get(cPOCNameDropDown).should("be.visible");
  }
  verifyresetButtonExists() {
    cy.xpath(resetButton).should("be.visible");
  }
  clickOnResetButton() {
    cy.xpath(resetButton).wait(1000);
    cy.xpath(resetButton).click();
  }
  clickauthorityDropDown() {
    cy.xpath(authorityDropDown).wait(1000);
    cy.xpath(authorityDropDown).click();
  }
  clickAuthorityDropDown() {
    cy.xpath(authorityDropDown).wait(1000);
    cy.xpath(authorityDropDown).click();
  }

  clickActionTypeDropDown() {
    cy.xpath(actionTypeDropDown).wait(1000);
    cy.xpath(actionTypeDropDown).click();
  }
  verify1915bTypeFilterExists() {
    cy.xpath(type1915bCheckBox).should("be.visible");
  }
  verify1915cTypeFilterExists() {
    cy.xpath(type1915cCheckBox).should("be.visible");
  }
  click1915bTypeFilterCheckBox() {
    cy.xpath(type1915bCheckBox).click();
  }
  click1915cTypeFilterCheckBox() {
    cy.xpath(type1915cCheckBox).click();
  }
  verifyWaiverRenewalFilterCheckBoxExists() {
    cy.xpath(waiverRenewalFilterCheckBox).should("be.visible");
  }
  verifyInitialWaiverFilterExists() {
    cy.xpath(initialWaiverCheckBox).should("be.visible");
  }
  verifyCHIPSPACheckBoxExists() {
    cy.xpath(CHIPSPACheckBox).should("be.visible");
  }
  verifyMedicaidSPACheckBoxExists() {
    cy.xpath(MedicaidSPACheckBox).should("be.visible");
  }
  clickstatusDropDown() {
    cy.xpath(statusDropDown).wait(1000);
    cy.xpath(statusDropDown).click();
  }
  verifyUnderReviewCheckBoxExists() {
    cy.xpath(underReviewCheckBox).should("be.visible");
  }
  clickUnderReviewCheckBox() {
    cy.xpath(underReviewCheckBox).click();
  }
  verifyTerminatedCheckBox() {
    cy.xpath(terminatedCheckBox).should("be.visible");
  }
  clickWaiverTerminatedCheckBox() {
    cy.xpath(terminatedCheckBox).click();
  }
  verifyWithdrawalRequestedCheckBoxExists() {
    cy.xpath(withdrawalRequestedCheckBox).should("be.visible");
  }
  clickWithdrawalRequestedCheckBox() {
    cy.xpath(withdrawalRequestedCheckBox).click();
  }
  verifyRaiResponseWithdrawalRequestedCheckBoxExists() {
    cy.xpath(raiResponseWithdrawalRequestedCheckBox).should("be.visible");
  }
  clickRaiResponseWithdrawalRequestedCheckBox() {
    cy.xpath(raiResponseWithdrawalRequestedCheckBox).click();
  }
  clickRaiResponseWithdrawEnabledCheckBox() {
    cy.xpath(raiResponseWithdrawEnabledCheckBox).click();
  }
  verifyWithdrawnCheckBoxExists() {
    cy.xpath(withdrawnCheckBox).should("be.visible");
  }
  clickWithdrawnCheckBoxExists() {
    cy.xpath(withdrawnCheckBox).first().click();
  }
  clickInitialWaiverCheckBox() {
    cy.xpath(initialWaiverCheckBox).click();
  }
  clickWaiverRenewalFilterCheckBox() {
    cy.xpath(waiverRenewalFilterCheckBox).click();
  }
  verify1915cAppendixKAmendmentCheckBox() {
    cy.xpath(appendixKAmendmentCheckBox).should("be.visible");
  }
  click1915cAppendixKAmendmentCheckBox() {
    cy.xpath(appendixKAmendmentCheckBox).click();
  }
  verifyWaiverAmendmentFilterCheckBox() {
    cy.xpath(waiverAmendmentFilterCheckbox).should("be.visible");
  }
  clickWaiverAmendmentFilterCheckBox() {
    cy.xpath(waiverAmendmentFilterCheckbox).click();
  }
  verify1915bTemporaryExtensionCheckBoxExists() {
    cy.xpath(temporaryExtension1915bCheckBox).should("be.visible");
  }
  verify1915cTemporaryExtensionCheckBoxExists() {
    cy.xpath(temporaryExtension1915cCheckBox).should("be.visible");
  }
  click1915bTemporaryExtensionCheckBox() {
    cy.xpath(temporaryExtension1915bCheckBox).click();
  }
  click1915cTemporaryExtensionCheckBox() {
    cy.xpath(temporaryExtension1915cCheckBox).click();
  }
  clickCHIPSPACheckBox() {
    cy.xpath(CHIPSPACheckBox).click();
  }
  clickMedicaidSPACheckBox() {
    cy.xpath(MedicaidSPACheckBox).click();
  }
  verifyraiResponseSubmittedCheckBoxExists() {
    cy.xpath(raiResponseSubmitted).should("be.visible");
  }
  verifyseaToolStatus1CheckBoxExists() {
    cy.xpath(seaToolStatus1).should("be.visible");
  }
  verifyMedicaidSPAInListExists() {
    cy.xpath(packageRowOneType).contains("Medicaid");
  }
  verifyInitialWaiverInListExists() {
    cy.xpath(packageRowOneType).contains("Initial Waiver");
  }
  verifyShowHideColumnsBTNExists() {
    cy.xpath(ShowHideColumnsBTN).parent("button").should("be.visible");
  }
  clickShowHideColumnsBTN() {
    cy.xpath(ShowHideColumnsBTN).parent("button").click();
  }
  verifycheckBoxInitialSubmissionDateExists() {
    cy.xpath(checkBoxInitialSubmissionDate).should("be.visible");
  }
  clickCheckBoxInitialSubmissionDate() {
    cy.xpath(checkBoxInitialSubmissionDate).click();
  }
  verifycheckboxStateExists() {
    cy.xpath(checkboxState).should("be.visible");
  }
  clickCheckboxState() {
    cy.xpath(checkboxState).click();
  }
  verifycheckBoxStatusExists() {
    cy.xpath(checkBoxStatus).should("be.visible");
  }
  clickCheckboxStatus() {
    cy.xpath(checkBoxStatus).click();
  }
  verifycheckBoxSubmittedByExists() {
    cy.xpath(checkBoxSubmittedBy).should("be.visible");
  }
  clickCheckBoxSubmittedBy() {
    cy.xpath(checkBoxSubmittedBy).click();
  }
  verifyCheckBoxAuthorityExists() {
    cy.xpath(checkBoxAuthority).should("be.visible");
  }
  verifycheckBoxTypeActionExists() {
    cy.xpath(checkBoxTypeAction).should("be.visible");
  }
  clickCheckBoxAuthority() {
    cy.xpath(checkBoxAuthority).click();
  }
  clickCheckBoxATypeAction() {
    cy.xpath(checkBoxTypeAction).click();
  }
  verifycheckBoxCPOCNameExists() {
    cy.xpath(checkboxCPOCName).should("be.visible");
  }
  clickCPOCNameCheckBox() {
    cy.xpath(checkboxCPOCName).click();
  }
  verifyWaiverNumberColumnExists() {
    cy.xpath(WaiverNumberColumn).should("be.visible");
  }
  verifyAuthorityColumnExists() {
    cy.xpath(authorityColumn).should("be.visible");
  }
  verifyActionTypeColumnExists() {
    cy.xpath(actionTypeColumn).should("be.visible");
  }
  verifystatusColumnExists() {
    cy.xpath(statusColumn).should("be.visible");
  }
  verifyinitialSubmissionDateColumnExists() {
    cy.xpath(initialSubmissionDateColumn).should("be.visible");
  }
  verifysubmittedByColumnExists() {
    cy.xpath(submittedByColumn).should("be.visible");
  }
  verifyactionsColumnExists() {
    cy.xpath(actionsColumn).should("exist");
  }
  verifyFormalRAIReceivedColumnExists() {
    cy.xpath(formalRAIReceivedColumn).scrollIntoView();
    cy.xpath(formalRAIReceivedColumn).should("be.visible");
  }
  verifyFormalRAIReceivedColumnDoesNotExist() {
    cy.xpath(formalRAIReceivedColumn).should("not.exist");
  }
  verifyFormalRAIResponseColumnExists() {
    cy.xpath(formalRAIResponseColumn).scrollIntoView();
    cy.xpath(formalRAIResponseColumn).should("be.visible");
  }
  verifyFormalRAIResponseColumnDoesNotExist() {
    cy.xpath(formalRAIResponseColumn).should("not.exist");
  }
  verifyIDNumberColumnDoesNotExist() {
    cy.xpath(IDNumberColumn).should("not.exist");
  }
  verifyAuthorityColumnDoesNotExist() {
    cy.xpath(authorityColumn).should("not.exist");
  }
  verifyActionTypeColumnDoesNotExist() {
    cy.xpath(actionTypeColumn).should("not.exist");
  }
  verifyStateColumnDoesNotExist() {
    cy.xpath(stateColumnHeader).should("not.exist");
  }
  verifystatusColumnDoesNotExist() {
    cy.xpath(statusColumn).should("not.exist");
  }
  verifyinitialSubmissionDateColumnDoesNotExist() {
    cy.xpath(initialSubmissionDateColumn).should("not.exist");
  }
  verifysubmittedByColumnDoesNotExist() {
    cy.xpath(submittedByColumn).should("not.exist");
  }
  verifyCPOCNameColumnExists() {
    cy.xpath(cPOCNameColumn).should("be.visible");
  }
  verifyCPOCNameColumnDoesNotExist() {
    cy.xpath(cPOCNameColumn).should("not.exist");
  }
  verifyactionsColumnDoesNotExist() {
    cy.xpath(actionsColumn).should("not.exist");
  }
  verifypackageRowOneTypeExists() {
    cy.xpath(packageRowOneType).should("be.visible");
  }
  verifypackageRowOneStateExists() {
    cy.get(packageRowOneState).should("be.visible");
  }
  checkforApprovedIsNotClickable() {
    cy.xpath(Approved).children("button").should("be.disabled");
  }
  checkforDisapprovedIsNotClickable() {
    cy.xpath(Disapproved).should("be.disabled");
  }
  checkforWithdrawnIsNotClickable() {
    cy.xpath(PackageWithdrawn).children("button").should("be.disabled");
  }
  checkforTerminatedIsNotClickable() {
    cy.xpath(waiverTerminated).should("be.disabled");
  }
  checkforUnsubmittedIsNotClickable() {
    cy.xpath(Unsubmitted).should("be.disabled");
  }

  verifyStateDropdownFilterExists() {
    cy.xpath(stateDropdownFilter).should("be.visible");
  }
  clickStateDropdownFilter() {
    cy.xpath(stateDropdownFilter).wait(1000);
    cy.xpath(stateDropdownFilter).click();
  }
  verifyFilterInputSelectExists() {
    cy.xpath(filterInput).should("be.visible");
  }
  verifyStatesSelectedIncludes(state) {
    cy.xpath(filterInput).parent().prev().contains(state);
  }
  verifyFilterInputSelectIsEmpty() {
    cy.xpath(filterInput).parent().prev().should("be.empty");
  }
  typeStateToSelect(state) {
    cy.xpath(filterInput).focus().type(state);
  }
  verifypackageRowOneValueIs(state) {
    cy.get(packageRowOneState).contains(state);
  }
  verifyremoveBtnExistsFor(state) {
    cy.xpath(removeBtn(state)).should("be.visible");
  }
  clickRemoveBtnFor(state) {
    cy.xpath(removeBtn(state)).click();
  }
  verifyWaiversTabExists() {
    cy.xpath(waiversTab).should("be.visible");
  }
  clickOnWaiversTab() {
    cy.xpath(waiversTab).click();
  }
  verifySPAsTabExists() {
    cy.xpath(spasTab).should("be.visible");
  }
  verifySPAIDColumnExists() {
    cy.xpath(IDNumberColumn).should("be.visible");
  }
  verifySPAsTabIsActive() {
    cy.xpath(spasTab).should("have.attr", "data-state", "active");
  }
  verifyWaiversTabIsActive() {
    cy.xpath(waiversTab).should("have.attr", "data-state", "active");
  }
  verifyWaiversTabIsClickable() {
    cy.xpath(waiversTab).should("have.attr", "data-state", "inactive");
  }
  verifyRaiIssuedCheckboxExists() {
    cy.xpath(raiIssuedCheckbox).should("be.visible");
  }
  clickRaiIssuedCheckbox() {
    cy.xpath(raiIssuedCheckbox).click();
  }
  clickPendingRaiCheckbox() {
    cy.xpath(pendingRaiCheckbox).click();
  }
  verifyPendingRaiCheckboxExists() {
    cy.xpath(pendingRaiCheckbox).should("be.visible");
  }
  clickPendingConcurrenceCheckbox() {
    cy.xpath(pendingConcurrenceCheckbox).click();
  }
  verifyPendingConcurrenceCheckboxExists() {
    cy.xpath(pendingConcurrenceCheckbox).should("be.visible");
  }
  clickPendingApprovalCheckbox() {
    cy.xpath(pendingApprovalCheckbox).click();
  }
  verifyPendingApprovalCheckboxExists() {
    cy.xpath(pendingApprovalCheckbox).should("be.visible");
  }
  verifyApprovedCheckboxExists() {
    cy.xpath(approvedCheckbox).should("be.visible");
  }
  clickApprovedCheckbox() {
    cy.xpath(approvedCheckbox).click();
  }
  verifyDisapprovedCheckboxExists() {
    cy.xpath(disapprovedCheckbox).should("be.visible");
  }
  clickDisapprovedCheckbox() {
    cy.xpath(disapprovedCheckbox).click();
  }
  verifySubmittedCheckboxExists() {
    cy.xpath(submittedCheckbox).should("be.visible");
  }
  clickSubmittedCheckbox() {
    cy.xpath(submittedCheckbox).click();
  }
  clickSubmittedIntakeNeededCheckbox() {
    cy.xpath(submittedIntakeNeededCheckbox).click();
  }
  verifySubmittedIntakeNeededCheckboxExists() {
    cy.xpath(submittedIntakeNeededCheckbox).should("be.visible");
  }
  clickDoubleDashCheckbox() {
    cy.xpath(doubleDashCheckbox).click();
  }
  clickPendingCheckbox() {
    cy.xpath(pendingCheckbox).click();
  }
  verifyUnsubmittedCheckboxExists() {
    cy.xpath(unsubmittedCheckbox).should("be.visible");
  }
  clickUnsubmittedCheckbox() {
    cy.xpath(unsubmittedCheckbox).click();
  }
  checkAllStatusFilterCheckboxes() {
    cy.get(statusFilterCheckboxes).each(($el) => {
      cy.wrap($el).check({ force: true });
    });
  }
  uncheckAllStatusFilterCheckboxes() {
    cy.get(statusFilterCheckboxes).each(($el) => {
      cy.wrap($el).uncheck({ force: true });
    });
  }
  checkAllTypeFilterCheckboxes() {
    cy.get(typeFilterCheckboxes).each(($el) => {
      cy.wrap($el).check({ force: true });
    });
  }
  uncheckAllTypeFilterCheckboxes() {
    cy.get(typeFilterCheckboxes).each(($el) => {
      cy.wrap($el).uncheck({ force: true });
    });
  }
  verifypackageRowOneIDWaiverFormat() {
    cy.xpath(packageRowOneIDLink).contains(
      /[A-Z]{2}\-\d{5}\.[A-Z]{1}\d{2}||[A-Z]{2}\-\d{4}\.[A-Z]{1}\d{2}/
    );
  }
  verifypackageRowOneTypeActionHasText(s) {
    cy.get(packageRowOne).should("contain.text", s);
  }
  verifypackageRowOneTypeHasText(s) {
    cy.get(packageRowOne).should("contain.text", s);
  }
  searchFor(part) {
    cy.get(searchbar).type(part + "{Enter}", { force: true });
  }

  clickWithdrawPackageBtn() {
    cy.xpath(withdrawPackageBtn)
      .filter(":visible")
      .each(($clickable) => {
        if ($clickable) {
          cy.wrap($clickable).click();
          return false; //quit after finding the right element
        }
      });
  }
  verifyWithdrawPackageBtnExists() {
    cy.xpath(withdrawPackageBtn).filter(":visible").first().should("exist");
  }
  verifyWithdrawPackageBtnDoesNotExists() {
    cy.xpath(withdrawPackageBtn).should("not.exist");
  }
  clickConfirmWithdrawPackageBtn() {
    cy.xpath(withdrawPackageConfirmBtn).click();
    cy.wait(8000);
  }
  clickConfirmWithdrawPackageBtnWithoutWaiting() {
    cy.xpath(withdrawPackageConfirmBtn).click();
  }
  verifyConfirmWithdrawPackageBtnExists() {
    cy.xpath(withdrawPackageConfirmBtn).should("be.visible");
  }
  clickConfirmWithdrawResponseBtn() {
    cy.xpath(withdrawResponseConfirmBtn).click();
    cy.wait(8000);
  }
  verifyConfirmWithdrawResponseBtnExists() {
    cy.xpath(withdrawResponseConfirmBtn).should("be.visible");
  }
  verifyChildRowStatusIs(status) {
    cy.get(packageRowTwoStatus).should("contain.text", status);
  }
  clickSPAIDLinkInFirstRow() {
    cy.xpath(packageRowOneIDLink).click();
  }
  clickPackageRowOneActionsBtn() {
    cy.xpath(packageRowOneActionsBtn).first().click();
  }
  clickRespondToRAIBtn() {
    cy.xpath(respondToRAIBtn).click({ force: true });
  }
  clickIssueRAIBtn() {
    cy.xpath(issueRAIBtn).click({ force: true });
  }
  verifyRespondToRAIBtnExists() {
    cy.xpath(respondToRAIBtn)
      .scrollIntoView()
      .should("exist")
      .and("not.be.disabled");
  }
  clickRequestTempExtensionBtn() {
    cy.xpath(RequestTempExtensionBtn).click();
  }
  verifyRequestTempExtensionBtnExists() {
    cy.xpath(RequestTempExtensionBtn).should("be.visible");
  }
  verifyAddAmendmentBtnExists() {
    cy.xpath(addAmendmentBtn).scrollIntoView().should("be.visible");
  }
  clickWaiverNumberLinkInFirstRow() {
    cy.xpath(packageRowOneIDLink).click({ force: true });
  }
  clickLinkForWaiver(n) {
    cy.xpath(waiverNumLink(n)).first().click();
  }
  verifyIDNumberInFirstRowIs(id) {
    cy.xpath(packageRowOneIDLink).contains(id);
  }
  verifyIDNumberInSecondRowIs(id) {
    cy.get(packageRowTwoID).contains(id);
  }
  compareSearchIDToFirstLinkID(searchedID) {
    cy.xpath(packageRowOneIDLink).should("have.text", searchedID);
  }
  verifyCPOCInFirstRow() {
    cy.get(packageRowOneCPOC).should("have.text", "Chester Tester");
  }
  copyTheIDFromLinkInFirstRow() {
    cy.xpath(packageRowOneIDLink)
      .invoke("text")
      .then((text) => {
        var f = "./fixtures/savedID.json";
        cy.writeFile(f, { savedID: text });
      });
  }
  verifyActionsColumnDoesNotExist() {
    cy.xpath(actionsColumn).should("not.exist");
  }
  verifyFinalDispositionCheckBoxExists() {
    cy.xpath(checkboxfinalDispositionDate).should("be.visible");
  }
  clickFinalDispositionDateCheckBox() {
    cy.xpath(checkboxfinalDispositionDate).click();
  }
  clickOnFinalDispositionDatePickerFilter() {
    cy.get(finalDispositionDatePickerFilter).wait(1000);
    cy.get(finalDispositionDatePickerFilter).last().click();
  }
  verifyFinalDispositionDateFilterDropdownExists() {
    cy.get(finalDispositionDateFilterDropdown).should("be.visible");
  }
  clickOnFinalDispositionDateFilterDropdownDropDown() {
    cy.get(finalDispositionDateFilterDropdown).wait(1000);
    cy.get(finalDispositionDateFilterDropdown).click();
  }
  verifyFinalDispositionColumnExists() {
    cy.get(finalDispositionColumn).should("be.visible");
  }
  verifyFinalDispositionColumnDoesNotExist() {
    cy.get(finalDispositionColumn).should("not.exist");
  }
}
export default oneMacDashboardPage;
