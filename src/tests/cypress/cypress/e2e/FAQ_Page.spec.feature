Feature: OY2_Update_Text_on_FAQ_Page
    Scenario: Verify General section includes appropriate clickable sections
        Given I am on Login Page
        When Clicking on FAQ Tab
        Then Verify General Section Exists
        Then Verify What browsers can I use to access the system link is displayed and click it
        Then Verify text contains The submission portal works best on Google Chrome
        Then Verify What should we do if we don’t receive a confirmation email is displayed and click it
        Then Verify text contains Refresh your inbox, check your SPAM filters, then contact the OneMAC Help Desk
        Then Verify Is this considered the official state submission is displayed and click it
        Then Verify text contains Yes as long as you have the electronic receipt confirmation email Your submission is considered your official state submission
        Then Verify What are the OneMAC user roles is displayed and click it
        Then Verify text contains State Submitter
        Then Verify text contains State System Administrator
        Then Verify text contains CMS Role Approver

    Scenario: Verify State Plan Amendments (SPAs) section includes appropriate clickable sections
        Given I am on Login Page
        When Clicking on FAQ Tab
        Then Verify State Plan Amendments SPAs Section Exists
        Then Verify What format is used to enter a SPA ID is displayed and click it
        Then Verify text contains Enter the State Plan Amendment transmittal number Assign consecutive numbers on a calendar year basis
        Then Verify What are the attachments for a Medicaid SPA is displayed and click it
        Then Verify text contains SPA submission requirements can be found in regulation
        Then Verify What are the attachments for a Medicaid response to Request for Additional Information RAI is displayed and click it
        Then Verify text contains "indicates a required attachment"
        Then Verify What are the attachments for a CHIP SPA is displayed and click it
        #here ongoing we might have to fix the next step
        Then Verify text contains "indicates a required attachment"
        Then Verify What are the attachments for a CHIP SPA response to Request for Additional Information RAI is displayed and click it
        Then Verify text contains "indicates a required attachment"
        Then Verify Can I submit SPAs relating to the Public Health Emergency PHE in OneMAC is displayed and click it
        Then Verify text contains "Yes, all PHE-related SPAs should be submitted through OneMAC"

    Scenario: Verify Waivers section includes appropriate clickable sections
        Given I am on Login Page
        When Clicking on FAQ Tab
        Then Verify Waivers Section Exists
        Then verify What format is used to enter a 1915b Initial Waiver number header is visible
        Then click What format is used to enter a 1915b Initial Waiver number header
        Then verify What format is used to enter a 1915b Initial Waiver number body is visible
        Then verify What format is used to enter a 1915b Waiver Renewal number header is visible
        Then click What format is used to enter a 1915b Waiver Renewal number header
        Then verify What format is used to enter a 1915b Waiver Renewal number is visible
        Then Verify Who can I contact to help me figure out the correct 1915b Waiver Number is displayed and click it
        Then Verify text contains "Email MCOGDMCOActions@cms.hhs.gov to get support with determining the correct 1915b Waiver Number"
        Then Verify What format is used to enter a 1915c waiver number is displayed and click it
        Then Verify text contains "Waiver number must follow the format SS.####.R##.## or SS.#####.R##.## to include"
        Then Verify What attachments are needed to submit a 1915b waiver action is displayed and click it
        Then Verify text contains "The regulations at 42 C.F.R. §430.25, 431.55 and 42 C.F.R. §441.301"
        Then Verify What are the attachments for a 1915b Waiver response to Request for Additional Information RAI is displayed and click it
        Then Verify text contains "indicates a required attachment"
        Then verify What format is used to enter a 1915b and 1915c Temporary Extension number header
        Then click What format is used to enter a 1915b and 1915c Temporary Extension number header
        Then verify What format is used to enter a 1915b and 1915c Temporary Extension number body is visible
        Then Verify What are the attachments for a 1915b Waiver Request for Temporary Extension is displayed and click it
        Then Verify text contains "indicates a required attachment"
        Then verify What are the attachments for a 1915c Waiver - Request for Temporary Extension header is visible
        Then click What are the attachments for a 1915c Waiver - Request for Temporary Extension header
        Then verify What are the attachments for a 1915c Waiver - Request for Temporary Extension body is visible
        Then Verify Can I submit Appendix K amendments in OneMAC is displayed and click it
        Then Verify text contains "Yes, you can submit Appendix K amendments"
        Then Verify What are the attachments for a 1915c Appendix K Waiver is displayed and click it
        Then Verify text contains "The regulations at 42 C.F.R. §430.25, 431.55 and 42 C.F.R. §441.301 describe the"

    Scenario: Verify OneMAC Help Desk Contact Info section includes appropriate clickable sections
        Given I am on Login Page
        When Clicking on FAQ Tab
        Then Verify OneMAC Help Desk Contact Info Section Exists
        Then Verify Phone Number Exists
        Then Verify actual Phone Number Exists
        Then verify Contact Email label Exists
        Then verify actual Contact Email address Exists

    Scenario: Verify screen enhancements on FAQ page
        Given I am on Login Page
        When Clicking on FAQ Tab
        Then Verify page title is "Frequently Asked Questions"

    Scenario: Verify redirect link on spa
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then click on New Submission
        Then Click on State Plan Amendment SPA
        Then click on Medicaid SPA
        Then click All Other Medicaid SPA Submissions
        Then click link labelled "What is my SPA ID?"
        Then Verify text contains Enter the State Plan Amendment transmittal number Assign consecutive numbers on a calendar year basis

    Scenario: Verify redirect link on 1915b4 waivers
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then click on New Submission
        Then Click on Waiver Action
        Then click on 1915b Waiver Actions
        Then click on 1915b 4 FFS Selective Contracting waivers
        Then click on 1915b 4 FFS Selective Contracting New Initial Waiver
        Then click link labelled "What is my Initial Waiver Number?"
        Then verify What format is used to enter a 1915b Initial Waiver number body is visible

    Scenario: Verify redirect link on 1915b waivers
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button
        Then click on New Submission
        Then Click on Waiver Action
        Then click on 1915b Waiver Actions
        Then click on "1915(b) Comprehensive (Capitated) Waiver Authority" choice
        Then click on "1915(b) Comprehensive (Capitated) Renewal Waiver" choice
        Then click link labelled "What is my 1915(b) Waiver Renewal Number?"
        Then verify What format is used to enter a 1915b Waiver Renewal number header is visible

    Scenario: Verify the Guides exist in the FAQ
        Given I am on Login Page
        When Clicking on FAQ Tab
        Then verify Onboarding Materials exists
        Then click on Onboarding Materials
        Then verify Welcome to OneMac link exists
        Then verify Welcome to OneMac link is valid
        Then verify IDM Instructions for OneMAC Users link exists
        Then verify IDM Instructions for OneMAC Users is valid
        Then verify OneMAC IDM Guide link exists
        Then verify OneMAC IDM Guide is valid
        Then verify OneMAC State User Guide link exists
        Then verify OneMAC State User Guide is valid
        Then verify OneMAC CMS User Guide link exists
        Then verify OneMAC CMS User Guide is valid