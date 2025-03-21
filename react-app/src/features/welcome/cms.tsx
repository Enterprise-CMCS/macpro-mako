export const CMSWelcome = () => {
  return (
    <div className="max-w-screen-xl mx-auto p-4 lg:px-8">
      <div className="flex flex-row justify-center gap-8">
        {/* Search section */}
        <div>
          <h1>Search Left</h1>
        </div>
        <div>
          <h1>Search Right</h1>
        </div>
      </div>
      <div className="justify-center">
        {/* Latest Updates section */}
        <h2>Latest Updates</h2>
      </div>
      <div className="justify-center">
        {/* Cards section */}
        <h2>Cards</h2>
      </div>
    </div>
  );
};
