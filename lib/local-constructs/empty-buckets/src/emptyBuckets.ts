export const handler = async function (event: any) {
  console.log("Request received:\n", JSON.stringify(event, null, 2));
  console.log(
    "This pattern is OBE.  For lifecycle reasons, it will remain until it's released, then removed entirely",
  );
};
