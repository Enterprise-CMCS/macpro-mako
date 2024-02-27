export const buildAddressList = (addressList, data) => {
    const newList = [];
    console.log("address list and data in: ", addressList, data);
    addressList.forEach((address) => {
      let mappedAddress = address;
      if (address === "submitterEmail")
        if (data.submitterEmail === "george@example.com")
          mappedAddress = `"George's Substitute" <k.grue.stateuser@gmail.com>`;
        else
          mappedAddress = `"${data.submitterName}" <${data.submitterEmail}>`;
      if (address === "osgEmail")
        mappedAddress = process?.env?.osgEmail ? process.env.osgEmail : "'OSG Substitute' <k.grue@theta-llc.com>";
      if (address === "chipInbox")
        mappedAddress = process?.env?.chipInbox ? process.env.chipInbox : "'CHIP Inbox Substitute' <k.grue@theta-llc.com>";
      if (address === "chipCcList")
        mappedAddress = process?.env?.chipCcList ? process.env.chipCcList : "'CHIP CC Substitute 1' <k.grue@theta-llc.com>;'CHIP CC Substitute 2' <k.grue.stateadmn@gmail.com>";
      if (address === "cpocEmailAndSrtList")
        mappedAddress = data?.cpocEmailAndSrtList ? data.cpocEmailAndSrtList : "'CPOC Substitute in mapaddress' <k.grue.cmsapprover@gmail.com>;'SRT 1 Substitute in mapaddress' <k.grue.cmsapprover@gmail.com>;'SRT 2 Substitute in mapaddress' <k.grue.stateadmn@gmail.com>";
  
      console.log("mapped address: ", mappedAddress);
      const extraAddresses = mappedAddress.split(';');
      extraAddresses.forEach((oneaddress) => {
        console.log("the individual address: ", oneaddress);
        newList.push(oneaddress);
      })
    });
    console.log("address list: ", newList);
    return newList;
  };