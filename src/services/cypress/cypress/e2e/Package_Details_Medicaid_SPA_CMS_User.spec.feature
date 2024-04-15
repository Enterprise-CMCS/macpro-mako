Feature: Medicaid SPA CMS Details View - Card View with Actions
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "CMS Read Only" user
        Then click the main Dashboard Button
        Then Click on Filter Button
        Then click on Authority
        Then click Medicaid SPA check box
        Then click on Authority
        Then click on Status

    Scenario: Screen Enhance - Pending Medicaid SPA
        Then click the Pending checkbox
        Then Click on the close Filter Button
        Then click the SPA ID link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Pending"
        Then verify the details section exists
        Then verify there is a Type header in the details section
        Then verify a type containing "Medicaid SPA" exists for the Authority
        Then verify there is a State header in the details section
        Then verify a state exists for the State
        Then verify there is an Initial Submission Date header in the details section
        Then verify a date exists for the Initial Submission Date
        Then verify there is a Proposed Effective Date header in the details section
        Then verify there is a Subject header in the details section
        Then verify the subject has a value displayed in the details section
        Then verify there is a description header in the details section
        Then verify there is a CPOC header in the details section
        Then verify the CPOC has a value displayed in the details section
        Then verify there is a Review Team SRT header in the details section
        Then verify the Review Team SRT has a value displayed in the details section
        Then verify there is a Final Disposition Date header in the details section
        Then verify there is an Approved Effective Date in the details section
        Then verify the description has a value displayed in the details section
        Then verify the package activity section exists
    #Then verify the additional information section exists

    Scenario: Screen Enhance - Withdrawn Medicaid SPA
        Then click the Package Withdrawn checkbox
        Then Click on the close Filter Button
        Then click the SPA ID link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Withdrawn"
        Then verify there are no package actions available
        Then verify the details section exists
        Then verify there is a Type header in the details section
        Then verify a type containing "Medicaid SPA" exists for the Authority
        Then verify there is a State header in the details section
        Then verify a state exists for the State
        Then verify there is an Initial Submission Date header in the details section
        Then verify a date exists for the Initial Submission Date
        Then verify there is a Proposed Effective Date header in the details section
        Then verify there is a Subject header in the details section
        Then verify the subject has a value displayed in the details section
        Then verify there is a description header in the details section
        Then verify there is a CPOC header in the details section
        Then verify the CPOC has a value displayed in the details section
        Then verify there is a Review Team SRT header in the details section
        Then verify the Review Team SRT has a value displayed in the details section
        Then verify there is a Final Disposition Date header in the details section
        Then verify there is an Approved Effective Date in the details section
        Then verify the description has a value displayed in the details section
        Then verify the Initial Submission caret button exists
        Then expand the Initial Submission caret
        Then verify the download all button exists

    Scenario: Screen Enhance - Disapproved Medicaid SPA
        Then click Disapproved checkbox
        Then Click on the close Filter Button
        Then click the SPA ID link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Disapproved"
        Then verify there are no package actions available
        Then verify the details section exists
        Then verify there is a Type header in the details section
        Then verify a type containing "Medicaid SPA" exists for the Authority
        Then verify there is a State header in the details section
        Then verify a state exists for the State
        Then verify there is an Initial Submission Date header in the details section
        Then verify a date exists for the Initial Submission Date
        Then verify there is a Proposed Effective Date header in the details section
        Then verify there is a Subject header in the details section
        Then verify the subject has a value displayed in the details section
        Then verify there is a description header in the details section
        Then verify there is a CPOC header in the details section
        Then verify the CPOC has a value displayed in the details section
        Then verify there is a Review Team SRT header in the details section
        Then verify the Review Team SRT has a value displayed in the details section
        Then verify there is a Final Disposition Date header in the details section
        Then verify there is an Approved Effective Date in the details section
        Then verify the description has a value displayed in the details section
        Then verify the Initial Submission caret button exists
        Then expand the Initial Submission caret
        Then verify the download all button exists

    # Need seed data / reset data update
    Scenario: Screen Enhance - Pending - RAI Medicaid SPA
        Then click Pending - RAI checkbox
        Then Click on the close Filter Button
        Then click the SPA ID link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Pending - RAI"
        Then verify there are no package actions available
        Then verify the package details page is visible
        Then verify the details section exists
        Then verify there is a Type header in the details section
        Then verify a type containing "Medicaid SPA" exists for the Authority
        Then verify there is a State header in the details section
        Then verify a state exists for the State
        Then verify there is an Initial Submission Date header in the details section
        Then verify a date exists for the Initial Submission Date
        Then verify there is a Proposed Effective Date header in the details section
        Then verify there is a Subject header in the details section
        Then verify the subject has a value displayed in the details section
        Then verify there is a description header in the details section
        Then verify there is a CPOC header in the details section
        Then verify the CPOC has a value displayed in the details section
        Then verify there is a Review Team SRT header in the details section
        Then verify the Review Team SRT has a value displayed in the details section
        Then verify there is a Final Disposition Date header in the details section
        Then verify there is an Approved Effective Date in the details section
        Then verify the description has a value displayed in the details section
        Then verify the package activity section exists
    #Then verify the additional information section exists

    Scenario: Screen Enhance - Approved Medicaid SPA
        Then click Approved checkbox
        Then Click on the close Filter Button
        Then click the SPA ID link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Approved"
        Then verify there are no package actions available
        Then verify the details section exists
        Then verify there is a Type header in the details section
        Then verify a type containing "Medicaid SPA" exists for the Authority
        Then verify there is a State header in the details section
        Then verify a state exists for the State
        Then verify there is an Initial Submission Date header in the details section
        Then verify a date exists for the Initial Submission Date
        Then verify there is a Proposed Effective Date header in the details section
        Then verify there is a Subject header in the details section
        Then verify the subject has a value displayed in the details section
        Then verify there is a description header in the details section
        Then verify there is a CPOC header in the details section
        Then verify the CPOC has a value displayed in the details section
        Then verify there is a Review Team SRT header in the details section
        Then verify the Review Team SRT has a value displayed in the details section
        Then verify there is a Final Disposition Date header in the details section
        Then verify there is an Approved Effective Date in the details section
        Then verify the description has a value displayed in the details section
        Then verify the Proposed Effective Date is a date formatted like mo dd yyyy
        Then verify the Initial Submission caret button exists
        Then expand the Initial Submission caret
        Then verify the download all button exists

    Scenario: Screen Enhance - Pending - Concurrence Medicaid SPA
        Then click the Pending - Concurrence checkbox
        Then Click on the close Filter Button
        Then click the SPA ID link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Pending - Concurrence"
        Then verify there are no package actions available
        Then verify the package details page is visible
        Then verify the details section exists
        Then verify there is a Type header in the details section
        Then verify a type containing "Medicaid SPA" exists for the Authority
        Then verify there is a State header in the details section
        Then verify a state exists for the State
        Then verify there is an Initial Submission Date header in the details section
        Then verify a date exists for the Initial Submission Date
        Then verify there is a Proposed Effective Date header in the details section
        Then verify there is a Subject header in the details section
        Then verify the subject has a value displayed in the details section
        Then verify there is a description header in the details section
        Then verify there is a CPOC header in the details section
        Then verify the CPOC has a value displayed in the details section
        Then verify there is a Review Team SRT header in the details section
        Then verify the Review Team SRT has a value displayed in the details section
        Then verify there is a Final Disposition Date header in the details section
        Then verify there is an Approved Effective Date in the details section
        Then verify the description has a value displayed in the details section
        Then verify the Initial Submission caret button exists
        Then expand the Initial Submission caret
        Then verify the download all button exists

    Scenario: Screen Enhance - Pending - Approval Medicaid SPA
        Then click the Pending - Approval checkbox
        Then Click on the close Filter Button
        Then click the SPA ID link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Pending - Approval"
        Then verify there are no package actions available
        Then verify the package details page is visible
        Then verify the details section exists
        Then verify there is a Type header in the details section
        Then verify a type containing "Medicaid SPA" exists for the Authority
        Then verify there is a State header in the details section
        Then verify a state exists for the State
        Then verify there is an Initial Submission Date header in the details section
        Then verify a date exists for the Initial Submission Date
        Then verify there is a Proposed Effective Date header in the details section
        Then verify there is a Subject header in the details section
        Then verify the subject has a value displayed in the details section
        Then verify there is a description header in the details section
        Then verify there is a CPOC header in the details section
        Then verify the CPOC has a value displayed in the details section
        Then verify there is a Review Team SRT header in the details section
        Then verify the Review Team SRT has a value displayed in the details section
        Then verify there is a Final Disposition Date header in the details section
        Then verify there is an Approved Effective Date in the details section
        Then verify the description has a value displayed in the details section
        Then verify the Initial Submission caret button exists
        Then expand the Initial Submission caret
        Then verify the download all button exists
