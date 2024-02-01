Feature: OY2-12297 Home Page Update - Include guidance for CMS User
    Scenario: verify key words exist properly on home page
        Given I am on Login Page
        Then Home tab exists
        Then FAQ tab exists
        Then Register exists
        Then Login Exists
        Then welcome message exists
        Then state users section exists
        Then cms users section exists
        Then do you have questions or need support exists
        Then View FAQ exists

    Scenario: verify state users section information
        Given I am on Login Page
        Then state users section exists
        Then How to create a submission exists
        Then Login with IDM Exists
        Then Login with IDM Info Exists
        Then attach your documents Exists
        Then attach your documents info Exists
        Then Receive an email confirmation Exists
        Then Receive an email confirmation details Exists
        Then Submission Types include Exists
        Then Amendments to your Medicaid and CHIP State Plans not submitted through MACPro MMDL or WMS Exists
        Then Official state responses to formal requests for additional information RAIs for SPAs not submitted through MACPro Exists
        Then Section 1915b waiver submissions those not submitted through WMS Exists
        Then Section 1915c Appendix K amendments which cannot be submitted through WMS Exists
        Then Official state responses to formal requests for additional information RAIs for Section 1915b waiver actions in addition to submitting waiver changes in WMS if applicable Exists

    Scenario: verify CMS Users section information
        Given I am on Login Page
        Then cms users section exists
        Then How to review a submission exists
        Then Receive an email for submission notification exists
        Then Receive an email for submission notification information exists
        Then Login with EUA exists
        Then Login with EUA information exists
        Then Review your assigned submission exists
        Then Review your assigned submission information exists
        Then Submission Types include Exists
        Then Amendments to your Medicaid and CHIP State Plans exists
        Then Official state responses to formal requests for additional information RAIs for SPAs exists
        Then Section 1915b waiver submissions exists
        Then Section 1915c Appendix K amendments exists
        Then Official state responses to formal requests for additional information RAIs for Section 1915b waiver actions exists
        Then State requests for Temporary Extensions for section 1915b and 1915c waivers exists