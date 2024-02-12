Feature: Package Dashboard - Filter
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "CMS System Admin" user
        Then click the main Dashboard Button

    Scenario: SPAs Tab - Screen enhancement
        Then Verify Filter button exists
        Then Click on Filter Button
        Then verify Filters header Exists
        Then verify the filter close button exists
        Then verify reset Exists
        Then verify state dropdown filter exists
        Then verify type dropdown filter exists
        Then verify status DropDown Filter exists
        Then verify Initial Submission Date filter dropdown exists
        Then verify Formal RAI Received dropdown filter exists
        #Then verify Final Disposition dropdown filter exists
        Then Click on My Account
        Then click the sign out button

    Scenario: Waivers Tab - Screen enhancement
        Then click on the Waivers tab
        Then Verify Filter button exists
        Then Click on Filter Button
        Then verify Filters header Exists
        Then verify the filter close button exists
        Then verify reset Exists
        Then verify state dropdown filter exists
        Then verify type dropdown filter exists
        Then verify status DropDown Filter exists
        Then verify Initial Submission Date filter dropdown exists
        Then verify Formal RAI Received dropdown filter exists
        #Then verify Final Disposition dropdown filter exists
        Then Click on My Account
        Then click the sign out button

    Scenario: SPAs tab - verify all types and statuses are available
        Then Click on Filter Button
        Then click on Type
        Then verify CHIP SPA Exists
        Then verify Medicaid SPA Exists
        Then click on Status
        Then verify Submitted - Intake Needed status checkbox exists
        Then verify Package Withdrawn status checkbox exists
        Then verify Pending - RAI status checkbox exists
        Then verify Approved checkbox exists
        Then verify Disapproved checkbox exists
        Then verify the Pending - Approval status checkbox exists
        Then verify the Pending - Concurrence status checkbox exists
        Then Click on My Account
        Then click the sign out button

    Scenario: Waivers tab - verify all types and statuses are available
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Type
        Then verify 1915b Initial Waiver exists
        Then verify 1915b Waiver Renewal exists
        Then verify 1915b Waiver Amendment check box exists
        Then verify 1915c Appendix K Amendment check box exists
        Then verify 1915b Temporary Extension exists
        Then verify 1915c Temporary Extension exists
        Then click on Status
        Then verify Submitted - Intake Needed status checkbox exists
        Then verify Package Withdrawn status checkbox exists
        Then verify Pending - RAI status checkbox exists
        Then verify Approved checkbox exists
        Then verify Disapproved checkbox exists
        Then verify the Pending - Approval status checkbox exists
        Then verify the Pending - Concurrence status checkbox exists
        Then Click on My Account
        Then click the sign out button

    Scenario: SPAs tab - deselect all and verify error message, then select one and verify it exists
        Then Click on Filter Button
        Then click on Type

        Then verify Error message displayed should be No Results Found
        Then verify Error message details is displayed
        Then click Medicaid SPA check box
        Then verify Medicaid SPA Exists in list
        Then Click on My Account
        Then click the sign out button

    Scenario: Waivers tab - deselect all and verify error message, then select one and verify it exists
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Type

        Then verify Error message displayed should be No Results Found
        Then verify Error message details is displayed
        Then click on Action Type
        Then click the Initial check box
        Then click the Renewal check box
        Then click 1915c Appendix K Amendment check box
        Then Click on My Account
        Then click the sign out button


    Scenario: SPAs tab - verify one exists, deselct selection then verify error message
        Then Click on Filter Button
        Then click on Type
        Then click CHIP SPA check box
        Then click Medicaid SPA check box
        Then verify Error message displayed should be No Results Found
        Then verify Error message details is displayed
        Then click Medicaid SPA check box
        Then verify Medicaid SPA Exists in list
        Then click Medicaid SPA check box
        Then verify Error message displayed should be No Results Found
        Then verify Error message details is displayed
        Then Click on My Account
        Then click the sign out button


    Scenario: Waivers tab - deselect all and verify error message, then select one and verify it exists
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Type
        Then verify Error message displayed should be No Results Found
        Then verify Error message details is displayed
        Then click on Action Type
        Then click the Initial check box
        Then verify 1915b Intial Waiver exists in list
        Then click on Action Type
        Then click the Initial check box
        Then verify Error message displayed should be No Results Found
        Then verify Error message details is displayed
        Then Click on My Account
        Then click the sign out button
