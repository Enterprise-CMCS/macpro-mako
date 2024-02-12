Feature: Package Dashboard Temporary Extension
    Background: reoccurring steps
        Given I am on Login Page
        When clicking the Sign In Button
        When Login with "an Active" "State Submitter" user

    Scenario: Verify user can create a temporary extension from new submission button
        Then click on New Submission
        Then Click on Waiver Action
        Then Click on Request Temporary Extension in Package dashboard
        Then select "1915(b)" as the Temporary Extension Type
        Then into "Existing Waiver Number to Renew" type "MD-2200.R00.00"
        Then into "Temporary Extension Request Number" type "MD-5533.R00.TE00"
        Then attach "picture.jpg" file to attachment 1
        Then into "Additional Information" type "This is just a test"
        Then Click on Submit Button
        Then verify submission successful message in the alert bar
        Then search for "MD-5533.R00.TE00"
        Then click the Waiver Number link in the first row
        Then verify the details section exists
        Then verify there is a Type header in the details section
        Then verify the type is 1915b Temporary Extension
        Then verify there is a Approved Initial or Renewal Number header in the details section
        Then verify the Approved Initial or Renewal Number ID is the approved intial waiver number 1
        Then verify there is an Initial Submission Date header in the details section
        Then verify a date exists for the Initial Submission Date

    Scenario: Verify user can create a temporary extension from the initial waiver package details
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Type

        Then click on Action Type
        Then click the Initial check box
        Then click on Type
        Then click on Status

        Then click Approved checkbox
        Then click the Waiver Number link in the first row
        Then verify Request a Temporary Extension package action exists
        Then click Request a Temporary Extension package action
        Then verify the Temporary Extension Type is "1915(b)"
        Then verify "Approved Initial or Renewal Waiver Number" is prefilled
        Then into "Temporary Extension Request Number" type "MD-5533.R00.TE02"
        Then attach "picture.jpg" file to attachment 1
        Then into "Additional Information" type "This is just a test."
        Then Click on Submit Button
        Then verify submission successful message in the alert bar

    Scenario: Verify user can create a temporary extension from the waiver renewal package details
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Type

        Then click the Renewal check box
        Then click on Type
        Then click on Status

        Then click Approved checkbox
        Then click the Waiver Number link in the first row
        Then verify Request a Temporary Extension package action exists
        Then click Request a Temporary Extension package action
        Then verify the Temporary Extension Type is "1915(b)"
        Then verify "Approved Initial or Renewal Waiver Number" is prefilled
        Then into "Temporary Extension Request Number" type "MD-5533.R00.TE03"
        Then attach "picture.jpg" file to attachment 1
        Then into "Additional Information" type "This is just a test."
        Then Click on Submit Button
        Then verify submission successful message in the alert bar

    Scenario: Verify user can create a temporary extension from the package dashboard waiver tab - initial
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Type

        Then click on Action Type
        Then click the Initial check box
        Then click on Type
        Then click on Status

        Then click Approved checkbox
        Then click the actions button in row one
        Then verify the Request Temporary Extension button is displayed
        Then click the Request Temporary Extension button
        Then verify the Temporary Extension Type is "1915(b)"
        Then verify "Approved Initial or Renewal Waiver Number" is prefilled
        Then into "Temporary Extension Request Number" type "MD-5533.R00.TE04"
        Then attach "picture.jpg" file to attachment 1
        Then into "Additional Information" type "This is just a test."
        Then Click on Submit Button
        Then verify submission successful message in the alert bar

    Scenario: Verify user can create a temporary extension from the package dashboard waiver tab - renewal
        Then click on the Waivers tab
        Then Click on Filter Button
        Then click on Type

        Then click the Renewal check box
        Then click on Type
        Then click on Status

        Then click Approved checkbox
        Then click the actions button in row one
        Then verify the Request Temporary Extension button is displayed
        Then click the Request Temporary Extension button
        Then verify the Temporary Extension Type is "1915(b)"
        Then verify "Approved Initial or Renewal Waiver Number" is prefilled
        Then into "Temporary Extension Request Number" type "MD-5533.R00.TE05"
        Then attach "picture.jpg" file to attachment 1
        Then into "Additional Information" type "This is just a test."
        Then Click on Submit Button
        Then verify submission successful message in the alert bar