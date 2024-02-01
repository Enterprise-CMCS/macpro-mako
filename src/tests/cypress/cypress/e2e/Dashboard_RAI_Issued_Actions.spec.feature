Feature: Verify package actions in RAI Issued Status in the package dashboard
    Background: Reoccurring steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click on Packages


    Scenario: Demonstrate withdraw package and respond to rai are available for CHIP SPA in RAI Issued Status
        Then Click on Filter Button
        Then click on Status
        Then uncheck all of the status checkboxes
        Then click RAI Issued checkbox
        Then click on Type
        Then uncheck all of the type checkboxes
        Then click CHIP SPA check box
        Then click the actions button in row one
        Then verify withdraw package button is visible for package in package dashboard
        Then verify the Respond to RAI button is displayed

    Scenario: Demonstrate withdraw package and respond to rai are available for Medicaid SPA in RAI Issued Status
        Then Click on Filter Button
        Then click on Status
        Then uncheck all of the status checkboxes
        Then click RAI Issued checkbox
        Then click on Type
        Then uncheck all of the type checkboxes
        Then click Medicaid SPA check box
        Then click the actions button in row one
        Then verify withdraw package button is visible for package in package dashboard
        Then verify the Respond to RAI button is displayed

    Scenario: Demonstrate withdraw package and respond to rai are available for Initial Waiver in RAI Issued Status
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Status
        Then uncheck all of the status checkboxes
        Then click RAI Issued checkbox
        Then click on Type
        Then uncheck all of the type checkboxes
        Then click 1915b Initial Waiver check box
        Then click the actions button in row one
        Then verify withdraw package button is visible for package in package dashboard
        Then verify the Respond to RAI button is displayed

    Scenario: Demonstrate withdraw package and respond to rai are available for Waiver Renewals in RAI Issued Status
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Status
        Then uncheck all of the status checkboxes
        Then click RAI Issued checkbox
        Then click on Type
        Then uncheck all of the type checkboxes
        Then click 1915b Waiver Renewal check box
        Then click the actions button in row one
        Then verify withdraw package button is visible for package in package dashboard
        Then verify the Respond to RAI button is displayed

    Scenario: Demonstrate withdraw package and respond to rai are available for Waiver Amendments in RAI Issued Status
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Status
        Then uncheck all of the status checkboxes
        Then click RAI Issued checkbox
        Then click on Type
        Then uncheck all of the type checkboxes
        Then click 1915b Waiver Amendment check box
        Then click the actions button in row one
        Then verify withdraw package button is visible for package in package dashboard
        Then verify the Respond to RAI button is displayed

    Scenario: Demonstrate withdraw package and respond to rai are available for Appendix K Amendments in RAI Issued Status
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Status
        Then uncheck all of the status checkboxes
        Then click RAI Issued checkbox
        Then click on Type
        Then uncheck all of the type checkboxes
        Then click 1915c Appendix K Amendment check box
        Then click the actions button in row one
        Then verify withdraw package button is visible for package in package dashboard
        Then verify the Respond to RAI button is displayed