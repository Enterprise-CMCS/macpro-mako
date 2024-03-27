#This entire test needs to be rewritten. Removing from deploy until I can think of a way to update this.
Feature: Verify user can package actions in Withdraw Formal RAI Response in the package dashboard
    Background: Reoccurring steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button

    Scenario: Demonstrate withdraw package and Withdraw Formal RAI Response are available for CHIP SPA in Withdraw Formal RAI Response Enabled Status
        Then Click on Filter Button
        Then click on Status
        Then click the Withdraw Formal RAI Response Enabled checkbox
        Then click on Authority
        Then click CHIP SPA check box
        Then Click on the close Filter Button
        Then click the actions button in row one
        Then verify withdraw package button is visible for package in package dashboard
        Then verify Withdraw Formal RAI Response package action exists

    Scenario: Demonstrate withdraw package and Withdraw Formal RAI Response are available for Medicaid SPA in Withdraw Formal RAI Response Enabled Status
        Then Click on Filter Button
        Then click on Status
        Then click the Withdraw Formal RAI Response Enabled checkbox
        Then click on Authority
        Then click Medicaid SPA check box
        Then Click on the close Filter Button
        Then click the actions button in row one
        Then verify withdraw package button is visible for package in package dashboard
        Then verify Withdraw Formal RAI Response package action exists

    Scenario: Demonstrate withdraw package and Withdraw Formal RAI Response are available for Initial Waiver in Withdraw Formal RAI Response Enabled Status
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Status
        Then click the Withdraw Formal RAI Response Enabled checkbox
        Then click on Authority
        Then click the 1915b check box
        Then click on Action Type
        Then click the Initial check box
        Then Click on the close Filter Button
        Then click the actions button in row one
        Then verify withdraw package button is visible for package in package dashboard
        Then verify Withdraw Formal RAI Response package action exists

    Scenario: Demonstrate withdraw package and Withdraw Formal RAI Response are available for Waiver Renewals in Withdraw Formal RAI Response Enabled Status
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Status
        Then click the Withdraw Formal RAI Response Enabled checkbox
        Then click on Authority
        Then click the 1915b check box
        Then click on Action Type
        Then click the Renewal check box
        Then Click on the close Filter Button
        Then click the actions button in row one
        Then verify withdraw package button is visible for package in package dashboard
        Then verify Withdraw Formal RAI Response package action exists

    Scenario: Demonstrate withdraw package and Withdraw Formal RAI Response are available for Waiver Amendments in Withdraw Formal RAI Response Enabled Status
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Status
        Then click the Withdraw Formal RAI Response Enabled checkbox
        Then click on Authority
        Then click the 1915b check box
        Then click on Action Type
        Then click the Waiver Amendment check box
        Then Click on the close Filter Button
        Then click the actions button in row one
        Then verify withdraw package button is visible for package in package dashboard
        Then verify Withdraw Formal RAI Response package action exists

# Scenario: Demonstrate withdraw package and Withdraw Formal RAI Response are available for Appendix K Amendments in Withdraw Formal RAI Response Enabled Status
#     Then click on the Waivers tab
#     Then Click on Filter Button
#     Then click on Status
#     Then click the Withdraw Formal RAI Response Enabled checkbox
#     Then click on Authority
#     Then click the 1915c check box
#     Then click on Action Type
#     Then click 1915c Appendix K Amendment check box
#     Then click the actions button in row one
#     Then verify withdraw package button is visible for package in package dashboard
#     Then verify Withdraw Formal RAI Response package action exists