Feature: Waiver Package Details View: Initial Waivers
    Background: Reoccuring Steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Authority
        Then click the 1915b check box
        Then click on Authority
        Then click on Action Type
        Then click the Initial check box
        Then click on Authority
        Then click on Status

    Scenario: Screen Enhance: Initial Waiver Details View - Under Review
        Then click Under Review checkbox
        Then Click on the close Filter Button
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Under Review"
        Then verify package actions header is visible
        Then verify withdraw package action exists
        Then verify the details section exists
        #Then verify the package details title contains "Initial Waiver Package"
        Then verify there is a Type header in the details section
        Then verify a type containing "1915(b)" exists for the Authority
        Then verify there is a State header in the details section
        Then verify a state exists for the State
        Then verify there is an Initial Submission Date header in the details section
        Then verify a date exists for the Initial Submission Date
        Then verify there is a Proposed Effective Date header in the details section
        Then verify the Proposed Effective Date is a date formatted like mo dd yyyy
        Then verify the Initial Submission caret button exists
        Then expand the Initial Submission caret
        Then verify the download all button exists
        Then verify subject is not visible in the details section
        Then verify description is not visible in the details section
        Then verify there is a CPOC header in the details section
        Then verify the CPOC has a value displayed in the details section
        Then verify Review Team SRT is not visible in the details section
        Then verify there is a Final Disposition Date header in the details section
        Then verify there is an Approved Effective Date in the details section

    Scenario: Screen Enhance: Initial Waiver Details View - Waiver Terminated
        Then click Waiver Terminated checkbox
        Then Click on the close Filter Button
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Waiver Terminated"
        Then verify there are no package actions available
        Then verify the details section exists
        #Then verify the package details title contains "Initial Waiver Package"
        Then verify there is a Type header in the details section
        Then verify a type containing "1915(b)" exists for the Authority
        Then verify there is a State header in the details section
        Then verify a state exists for the State
        Then verify there is an Initial Submission Date header in the details section
        Then verify a date exists for the Initial Submission Date
        Then verify there is a Proposed Effective Date header in the details section
        Then verify the Initial Submission caret button exists
        Then expand the Initial Submission caret
        Then verify the download all button exists
        Then verify subject is not visible in the details section
        Then verify description is not visible in the details section
        Then verify there is a CPOC header in the details section
        Then verify the CPOC has a value displayed in the details section
        Then verify Review Team SRT is not visible in the details section
        Then verify there is a Final Disposition Date header in the details section
        Then verify there is an Approved Effective Date in the details section

    Scenario: Screen Enhance: Initial Waiver Details View - RAI Issued
        Then click RAI Issued checkbox
        Then Click on the close Filter Button
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "RAI Issued"
        Then verify package actions header is visible
        Then verify withdraw package action exists
        Then verify Respond to Formal RAI action exists
        Then verify the details section exists
        #Then verify the package details title contains "Initial Waiver Package"
        Then verify there is a Type header in the details section
        Then verify a type containing "1915(b)" exists for the Authority
        Then verify there is a State header in the details section
        Then verify a state exists for the State
        Then verify there is an Initial Submission Date header in the details section
        Then verify a date exists for the Initial Submission Date
        Then verify there is a Proposed Effective Date header in the details section
        Then verify the Initial Submission caret button exists
        Then expand the Initial Submission caret
        Then verify the download all button exists
        Then verify subject is not visible in the details section
        Then verify description is not visible in the details section
        Then verify there is a CPOC header in the details section
        Then verify the CPOC has a value displayed in the details section
        Then verify Review Team SRT is not visible in the details section
        Then verify there is a Final Disposition Date header in the details section
        Then verify there is an Approved Effective Date in the details section

    Scenario: Screen Enhance: Initial Waiver Details View - Approved
        Then click Approved checkbox
        Then Click on the close Filter Button
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Approved"
        Then verify package actions header is visible
        Then verify Add Amendment package action exists
        Then verify Request a Temporary Extension package action exists
        Then verify the details section exists
        #Then verify the package details title contains "Initial Waiver Package"
        Then verify there is a Type header in the details section
        Then verify a type containing "1915(b)" exists for the Authority
        Then verify there is a State header in the details section
        Then verify a state exists for the State
        Then verify there is an Initial Submission Date header in the details section
        Then verify a date exists for the Initial Submission Date
        Then verify there is a Proposed Effective Date header in the details section
        Then verify the Initial Submission caret button exists
        Then expand the Initial Submission caret
        Then verify the download all button exists
        Then verify subject is not visible in the details section
        Then verify description is not visible in the details section
        Then verify there is a CPOC header in the details section
        Then verify the CPOC has a value displayed in the details section
        Then verify Review Team SRT is not visible in the details section
        Then verify there is a Final Disposition Date header in the details section
        Then verify there is an Approved Effective Date in the details section

    Scenario: Screen Enhance: Initial Waiver Details View - Disapproved
        Then click Disapproved checkbox
        Then Click on the close Filter Button
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Disapproved"
        Then verify package actions header is visible
        Then verify there are no package actions available
        Then verify the details section exists
        #Then verify the package details title contains "Initial Waiver Package"
        Then verify there is a Type header in the details section
        Then verify a type containing "1915(b)" exists for the Authority
        Then verify there is a State header in the details section
        Then verify a state exists for the State
        Then verify there is an Initial Submission Date header in the details section
        Then verify a date exists for the Initial Submission Date
        Then verify there is a Proposed Effective Date header in the details section
        Then verify the Initial Submission caret button exists
        Then expand the Initial Submission caret
        Then verify the download all button exists
        Then verify subject is not visible in the details section
        Then verify description is not visible in the details section
        Then verify there is a CPOC header in the details section
        Then verify the CPOC has a value displayed in the details section
        Then verify Review Team SRT is not visible in the details section
        Then verify there is a Final Disposition Date header in the details section
        Then verify there is an Approved Effective Date in the details section

    Scenario: Screen Enhance: Initial Waiver Details View - Package Withdrawn
        Then click the Package Withdrawn checkbox
        Then Click on the close Filter Button
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Package Withdrawn"
        Then verify package actions header is visible
        Then verify there are no package actions available
        Then verify the details section exists
        #Then verify the package details title contains "Initial Waiver Package"
        Then verify there is a Type header in the details section
        Then verify a type containing "1915(b)" exists for the Authority
        Then verify there is a State header in the details section
        Then verify a state exists for the State
        Then verify there is an Initial Submission Date header in the details section
        Then verify a date exists for the Initial Submission Date
        Then verify there is a Proposed Effective Date header in the details section
        Then verify the Initial Submission caret button exists
        Then expand the Initial Submission caret
        Then verify the download all button exists
        Then verify subject is not visible in the details section
        Then verify description is not visible in the details section
        Then verify there is a CPOC header in the details section
        Then verify the CPOC has a value displayed in the details section
        Then verify Review Team SRT is not visible in the details section
        Then verify there is a Final Disposition Date header in the details section
        Then verify there is an Approved Effective Date in the details section

    Scenario: Screen Enhance: Initial Waiver Details View - Withdraw Formal RAI Response Enabled
        Then click Under Review checkbox
        Then Click on the close Filter Button
        Then search for "MD-22116.R00.00"
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then verify the sub status on the card is Withdraw Formal RAI Response Enabled
        Then verify package actions header is visible
        Then verify withdraw package action exists
        Then verify Withdraw Formal RAI Response package action exists
        Then verify the details section exists
        #Then verify the package details title contains "Initial Waiver Package"
        Then verify there is a Type header in the details section
        Then verify a type containing "1915(b)" exists for the Authority
        Then verify there is a State header in the details section
        Then verify a state exists for the State
        Then verify there is an Initial Submission Date header in the details section
        Then verify a date exists for the Initial Submission Date
        Then verify there is a Proposed Effective Date header in the details section
        Then verify the Initial Submission caret button exists
        Then expand the Initial Submission caret
        Then verify the download all button exists
        Then verify subject is not visible in the details section
        Then verify description is not visible in the details section
        Then verify there is a CPOC header in the details section
        Then verify the CPOC has a value displayed in the details section
        Then verify Review Team SRT is not visible in the details section
        Then verify there is a Final Disposition Date header in the details section
        Then verify there is an Approved Effective Date in the details section

    Scenario: Initial Waiver Details View - Withdraw RAI Response
        Then click Under Review checkbox
        Then click RAI Issued checkbox
        Then Click on the close Filter Button
        Then search for "MD-22116.R00.00"
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then verify the sub status on the card is Withdraw Formal RAI Response Enabled
        Then click Withdraw Formal RAI Response package action
        Then into "Additional Information" type "Automated test to withdraw the RAI Response."
        Then Click the Submit Button without waiting
        Then verify Yes, withdraw response button exists
        Then click Yes, withdraw response button
        Then verify the success message is "Withdraw Formal RAI Response request has been submitted."
        Then verify the status on the card is "Formal RAI Response - Withdrawal Requested"
        Then verify package actions header is visible
        Then verify there are no package actions available
