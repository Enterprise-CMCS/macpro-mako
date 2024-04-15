Feature: Waiver Package Details View: Appendix K Amendment for a State User
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
        Then click 1915c Appendix K Amendment check box
        Then click on Action Type
        Then click on Status

    Scenario: Screen Enhance: Appendix K Details View - Submitted
        #Then click Submitted checkbox
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Submitted"
        Then verify package actions header is visible
        Then verify there are no package actions available
        Then verify the details section exists
        Then verify the package details title contains "Appendix K Amendment Package"
        Then verify the waiver authority header exists
        Then verify the waiver authority is 1915c HCBS
        Then verify there is a State header in the details section
        Then verify a state exists for the State
        Then verify there is an Amendment Title header in the details section
        Then verify there is an Amendment Title under the header
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

    Scenario: Screen Enhance: Appendix K Details View - Under Review
        Then click Under Review checkbox
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Under Review"
        Then verify package actions header is visible
        Then verify withdraw package action exists
        Then verify the details section exists
        Then verify the package details title contains "Appendix K Amendment Package"
        Then verify the waiver authority header exists
        Then verify the waiver authority is 1915c HCBS
        Then verify there is a State header in the details section
        Then verify a state exists for the State
        Then verify there is an Amendment Title header in the details section
        Then verify there is an Amendment Title under the header
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

    Scenario: Screen Enhance: Appendix K Details View - RAI Issued
        Then click RAI Issued checkbox
        Then Click on the close Filter Button
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "RAI Issued"
        Then verify package actions header is visible
        Then verify withdraw package action exists
        Then verify Respond to Formal RAI action exists
        Then verify the details section exists
        Then verify the package details title contains "Appendix K Amendment Package"
        Then verify the waiver authority header exists
        Then verify the waiver authority is 1915c HCBS
        Then verify there is a State header in the details section
        Then verify a state exists for the State
        Then verify there is an Amendment Title header in the details section
        Then verify there is an Amendment Title under the header
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

    Scenario: Screen Enhance: Appendix K Details View - Approved
        Then click Approved checkbox
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Approved"
        Then verify package actions header is visible
        Then verify there are no package actions available
        Then verify the details section exists
        Then verify the package details title contains "Appendix K Amendment Package"
        Then verify the waiver authority header exists
        Then verify the waiver authority is 1915c HCBS
        Then verify there is a State header in the details section
        Then verify a state exists for the State
        Then verify there is an Amendment Title header in the details section
        Then verify there is an Amendment Title under the header
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

    Scenario: Screen Enhance: Appendix K Details View - Disapproved
        Then click Disapproved checkbox
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Disapproved"
        Then verify package actions header is visible
        Then verify there are no package actions available
        Then verify the details section exists
        Then verify the package details title contains "Appendix K Amendment Package"
        Then verify the waiver authority header exists
        Then verify the waiver authority is 1915c HCBS
        Then verify there is a State header in the details section
        Then verify a state exists for the State
        Then verify there is an Amendment Title header in the details section
        Then verify there is an Amendment Title under the header
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

    Scenario: Screen Enhance: Appendix K Details View - Package Withdrawn
        Then click the Package Withdrawn checkbox
        Then click the Waiver Number link in the first row
        Then verify the package details page is visible
        Then verify the status on the card is "Package Withdrawn"
        Then verify package actions header is visible
        Then verify there are no package actions available
        Then verify the details section exists
        Then verify the package details title contains "Appendix K Amendment Package"
        Then verify the waiver authority header exists
        Then verify the waiver authority is 1915c HCBS
        Then verify there is a State header in the details section
        Then verify a state exists for the State
        Then verify there is an Amendment Title header in the details section
        Then verify there is an Amendment Title under the header
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
