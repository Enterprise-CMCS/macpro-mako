Feature: Package Dashboard Temporary Extension
    Background: reoccurring steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user
        Then click the main Dashboard Button

    Scenario: Verify user can create a temporary extension from new submission button
        Then click on New Submission
        Then Click on Waiver Action
        Then click on "Request Temporary Extension" choice
        Then select "1915(c)" as the Temporary Extension Type
        Then into "Approved Initial or Renewal Waiver Number" type "MD-5000.R00.00"
        Then type the generated "1915(c) Temporary Extension Request Number" Number 2 into the ID Input box using the state "MD"
        Then attach "picture.jpg" file to attachment 1
        Then into "Additional Information" type "This an automated test to createa a 1915(c) test."
        Then Click on Submit Button
        Then verify the message in the alert bar is "Temporary Extension issued"
        Then click on the Waivers tab
        Then search for the generated "1915(c) Temporary Extension Request Number" Number 2
        Then verify the id number in the first row matches the generated "1915(c) Temporary Extension Request Number" Number 2
        Then click the Waiver Number link in the first row
        Then verify the details section exists
        Then verify there is a Type header in the details section
        Then verify a type containing "1915(c) Temporary Extension" exists for the Authority
        Then verify there is a Approved Initial or Renewal Number header in the details section
        Then verify the Approved Initial or Renewal Number ID is the approved intial waiver number 1
        Then verify there is an Initial Submission Date header in the details section
        Then verify a date exists for the Initial Submission Date

#1915(c) Initial and Renewal Waivers don't exist in system at the moment
# Scenario: Verify user can create a temporary extension from the initial waiver package details
#     Then click on the Waivers tab
#     Then Click on Filter Button
#     Then click on Authority
#     Then click the 1915c check box
#     Then click on Authority
#     Then click on Action Type
#     Then click the Initial check box
#     Then click on Authority
#     Then click on Status
#     Then click Approved checkbox
#     Then Click on the close Filter Button
#     Then click the Waiver Number link in the first row
#     Then verify Request a Temporary Extension package action exists
#     Then click Request a Temporary Extension package action
#     Then verify the Temporary Extension Type is "1915(b)"
#     Then verify "Approved Initial or Renewal Waiver Number" is prefilled
#     Then type the generated "1915(c) Temporary Extension Request Number" Number ? into the ID Input box using the state "MD"
#     Then attach "picture.jpg" file to attachment 1
#     Then into "Additional Information" type "This is just a test."
#     Then Click on Submit Button
#     Then verify submission successful message in the alert bar

# Scenario: Verify user can create a temporary extension from the waiver renewal package details
#     Then click on the Waivers tab
#     Then Click on Filter Button
#     Then click on Authority
#     Then click the 1915c check box
#     Then click on Authority
#     Then click on Action Type
#     Then click the Renewal check box
#     Then click on Authority
#     Then click on Status
#     Then click Approved checkbox
#     Then Click on the close Filter Button
#     Then click the Waiver Number link in the first row
#     Then verify Request a Temporary Extension package action exists
#     Then click Request a Temporary Extension package action
#     Then verify the Temporary Extension Type is "1915(b)"
#     Then verify "Approved Initial or Renewal Waiver Number" is prefilled
#     Then type the generated "1915(c) Temporary Extension Request Number" Number ? into the ID Input box using the state "MD"
#     Then attach "picture.jpg" file to attachment 1
#     Then into "Additional Information" type "This is just a test."
#     Then Click on Submit Button
#     Then verify submission successful message in the alert bar

# Scenario: Verify user can create a temporary extension from the package dashboard waiver tab - initial
#     Then click on the Waivers tab
#     Then Click on Filter Button
#     Then click on Authority
#     Then click the 1915c check box
#     Then click on Authority
#     Then click on Action Type
#     Then click the Initial check box
#     Then click on Authority
#     Then click on Status
#     Then click Approved checkbox
#     Then Click on the close Filter Button
#     Then click the actions button in row one
#     Then verify the Request Temporary Extension button is displayed
#     Then click the Request Temporary Extension button
#     Then verify the Temporary Extension Type is "1915(b)"
#     Then verify "Approved Initial or Renewal Waiver Number" is prefilled
#     Then type the generated "1915(c) Temporary Extension Request Number" Number ? into the ID Input box using the state "MD"
#     Then attach "picture.jpg" file to attachment 1
#     Then into "Additional Information" type "This is just a test."
#     Then Click on Submit Button
#     Then verify submission successful message in the alert bar

# Scenario: Verify user can create a temporary extension from the package dashboard waiver tab - renewal
#     Then click on the Waivers tab
#     Then Click on Filter Button
#     Then click on Authority
#     Then click the 1915c check box
#     Then click on Authority
#     Then click on Action Type
#     Then click the Renewal check box
#     Then click on Authority
#     Then click on Status
#     Then click Approved checkbox
#     Then Click on the close Filter Button
#     Then click the actions button in row one
#     Then verify the Request Temporary Extension button is displayed
#     Then click the Request Temporary Extension button
#     Then verify the Temporary Extension Type is "1915(b)"
#     Then verify "Approved Initial or Renewal Waiver Number" is prefilled
#     Then type the generated "1915(c) Temporary Extension Request Number" Number ? into the ID Input box using the state "MD"
#     Then attach "picture.jpg" file to attachment 1
#     Then into "Additional Information" type "This is just a test."
#     Then Click on Submit Button
#     Then verify submission successful message in the alert bar