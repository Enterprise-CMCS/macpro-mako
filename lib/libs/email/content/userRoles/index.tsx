/*
ACCESS CHANGE NOTICE--- (from updateUserStatus.js)
subject: `Your OneMAC ${roleLabels[role]} Access${moreSpecificAccess} has been ${statusLabels[status]}`,
fromAddressSource: "userAccessEmailSource",
ToAddresses: [`${fullName} <${email}>`],

ACCESS PENDING NOTICE-- (from requestAccess.js)
    fromAddressSource: "userAccessEmailSource",
    ToAddresses: [`${fullName} <${email}>`],
    Subject: "Your OneMAC Role Access is Pending Review",

ADMIN PENDING NOTICE---(from requestAccess.js)
 fromAddressSource: "userAccessEmailSource",
    ToAddresses: approverList.map(
      ({ fullName, email }) => `${fullName} <${email}>`
    ),
    Subject: `New OneMAC ${roleLabels[role]} Access Request`,

SELF REVOKE ADMIN CHANGE--- (from updateUserStatus.js)
 Subject: `OneMAC State access for ${territoryMap[territory]} was self-revoked by ${fullName}`,
 fromAddressSource: "userAccessEmailSource",
 ToAddresses: approverList.map(
      ({ fullName, email }) => `${fullName} <${email}>`
    ),
   
*/
