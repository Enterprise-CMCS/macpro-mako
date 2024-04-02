Feature: Package Dashboard - Filter
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button

    Scenario: SPAs Tab - Screen enhancement
        Then Verify Filter button exists
        Then Click on Filter Button
        Then verify Filters header Exists
        Then verify the filter close button exists
        Then verify reset Exists
        Then verify state dropdown filter exists
        Then verify authority dropdown filter exists
        Then verify status DropDown Filter exists
        Then verify Initial Submission Date filter dropdown exists
        Then click on Initial Submission Date filter dropdown
        Then verify the date picker for the filter exists
        Then click on Initial Submission Date filter dropdown
        Then verify Formal RAI Received dropdown filter exists
        Then click on Formal RAI Received dropdown filter
        Then verify the date picker for the filter exists
        Then click on Formal RAI Received dropdown filter
        #Then verify Final Disposition dropdown filter exists
        #Then click on Final Disposition dropdown filter
        #Then verify the date picker for the filter exists
        #Then click on Final Disposition dropdown filter
        Then Click on the close Filter Button
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
        Then verify authority dropdown filter exists
        Then verify status DropDown Filter exists
        Then verify Initial Submission Date filter dropdown exists
        Then click on Initial Submission Date filter dropdown
        Then verify the date picker for the filter exists
        Then verify Formal RAI Received dropdown filter exists
        #Then verify Final Disposition dropdown filter exists
        Then Click on the close Filter Button
        Then Click on My Account
        Then click the sign out button

    Scenario: SPAs tab - verify all types and statuses are available
        Then Click on Filter Button
        Then click on Authority
        Then verify CHIP SPA Exists
        Then verify Medicaid SPA Exists
        Then click on Status
        #Then #verify Submitted status checkbox exists
        Then verify Package Withdrawn status checkbox exists
        Then verify RAI Issued status checkbox exists
        Then verify Under Review checkbox exists
        Then verify Approved checkbox exists
        Then verify Disapproved checkbox exists
        Then Click on the close Filter Button
        Then Click on My Account
        Then click the sign out button

    Scenario: Waivers tab - verify all types and statuses are available
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Authority
        Then verify the 1915b type filter exists
        Then verify the 1915c type filter exists
        Then click on Authority
        Then click on Action Type
        Then verify the Initial type action filter exists
        Then verify the Renewal type action filter exists
        Then verify the Amendment type action filter exists
        #Then verify the Appendix K Amendment type action filter exists
        #Then verify the Temporary Extension type action filter exists
        Then click on Action Type
        Then click on Status
        #Then #verify Submitted status checkbox exists
        Then verify Package Withdrawn status checkbox exists
        Then verify RAI Issued status checkbox exists
        Then verify Under Review checkbox exists
        Then verify Approved checkbox exists
        Then verify Disapproved checkbox exists
        Then Click on the close Filter Button
        Then Click on My Account
        Then click the sign out button
