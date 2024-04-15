Feature: Waiver Package Details View: 1915 b Waiver Amendment for a CMS User
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "CMS Read Only" user
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Authority
        Then click the 1915b check box
        Then click on Authority
        Then click on Action Type
        Then click the Waiver Amendment check box
        Then click on Action Type
        Then click on Status

    Scenario: Screen Enhance: 1915 b Waiver Amendment Details View - Pending
        Then click the Pending checkbox
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Pending"
        Then verify the details section exists
        Then verify there is a Type header in the details section
        Then verify a type containing "1915(b)" exists for the Authority
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

    Scenario: Screen Enhance: 1915 b Waiver Amendment Details View - Pending - RAI
        Then click Pending - RAI checkbox
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Pending - RAI"
        Then verify there are no package actions available
        Then verify the details section exists
        Then verify there is a Type header in the details section
        Then verify a type containing "1915(b)" exists for the Authority
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

    Scenario: Screen Enhance: 1915 b Waiver Amendment Details View - Approved
        Then click Approved checkbox
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Approved"
        Then verify there are no package actions available
        Then verify the details section exists
        Then verify there is a Type header in the details section
        Then verify a type containing "1915(b)" exists for the Authority
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

    Scenario: Screen Enhance: 1915 b Waiver Amendment Details View - Disapproved
        Then click Disapproved checkbox
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Disapproved"
        Then verify there are no package actions available
        Then verify the details section exists
        Then verify there is a Type header in the details section
        Then verify a type containing "1915(b)" exists for the Authority
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
    Scenario: Screen Enhance: 1915 b Waiver Amendment Details View - Withdrawn
        Then click the Package Withdrawn checkbox
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Package Withdrawn"
        Then verify there are no package actions available
        Then verify the details section exists
        Then verify there is a Type header in the details section
        Then verify a type containing "1915(b)" exists for the Authority
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

    Scenario: Screen Enhance: 1915 b Waiver Amendment Details View - Pending - Concurrence
        Then click the Pending - Concurrence checkbox
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Pending - Concurrence"
        Then verify there are no package actions available
        Then verify the details section exists
        Then verify there is a Type header in the details section
        Then verify a type containing "1915(b)" exists for the Authority
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
    Scenario: Screen Enhance: 1915 b Waiver Amendment Details View - Pending - Approval
        Then click the Pending - Approval checkbox
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Pending - Approval"
        Then verify there are no package actions available
        Then verify the details section exists
        Then verify there is a Type header in the details section
        Then verify a type containing "1915(b)" exists for the Authority
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
