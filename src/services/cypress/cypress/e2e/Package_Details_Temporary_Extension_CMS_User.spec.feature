Feature: Waiver Package Details View: Temporary Extension for a CMS User
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "CMS Read Only" user
        Then click the main Dashboard Button
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Action Type
        Then click the Extend check box
        Then click on Action Type
        Then click on Authority

    Scenario: Screen Enhance: 1915b Temporary Extension Details View - Requested
        Then click the 1915b check box
        Then click on Authority
        Then click on Status
        Then click Requested checkbox
        Then Click on the close Filter Button
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Requested"
        Then verify there are no package actions available
        Then verify the details section exists
        Then verify there is a Type header in the details section
        Then verify a type containing "1915(b) Temporary Extension" exists for the Authority
        Then verify there is an Initial Submission Date header in the details section
        Then verify a date exists for the Initial Submission Date
        Then verify the Initial Submission caret button exists
        Then expand the Initial Submission caret
        Then verify the download all button exists
        Then verify subject is not visible in the details section
        Then verify description is not visible in the details section

    Scenario: Screen Enhance: 1915c Temporary Extension Details View - Requested
        Then click the 1915c check box
        Then click on Authority
        Then click on Status
        Then click Requested checkbox
        Then Click on the close Filter Button
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Requested"
        Then verify there are no package actions available
        Then verify the details section exists
        Then verify there is a Type header in the details section
        Then verify a type containing "1915(c) Temporary Extension" exists for the Authority
        Then verify there is an Initial Submission Date header in the details section
        Then verify a date exists for the Initial Submission Date
        Then verify the Initial Submission caret button exists
        Then expand the Initial Submission caret
        Then verify the download all button exists
        Then verify subject is not visible in the details section
        Then verify description is not visible in the details section
        Then verify CPOC is not visible in the details section
        Then verify Review Team SRT is not visible in the details section
        Then verify there not is a Final Disposition Date header in the details section
        Then verify there is not an Approved Effective Date header in the details section