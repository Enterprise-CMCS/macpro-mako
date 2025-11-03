/**
 * from the command line run this code to generate a 2FA code for OneMAC
 * totp secret required
 */

import * as OTPAuth from "otpauth";

const totp = new OTPAuth.TOTP({
  issuer: "idm.cms.gov",
  label: process.env.MFAUSER, // must be a string
  algorithm: "SHA1",
  digits: 6,
  period: 30,
  secret: process.env.TOTPSECRET, // must be a string
});

const token = totp.generate();

console.log("Google Auth token: ", token);
