export const AdditionalInfo = (data:any) => {
  return (
    <div className="flex flex-col gap-4">
      <p>
        {/* This seems to be what drives the width of the page... so when this is a smalls entence, the page is skinny.  See MD-10-2686 for an example */}
        {data.additionalInfo || "None"}
      </p>
    </div>
  );
};
