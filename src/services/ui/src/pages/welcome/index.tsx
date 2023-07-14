export const Welcome = () => {
  return (
    <>
      {/*  Hero Section */}
      <div className="w-full bg-accent p-4">
        <div className="max-w-screen-lg mx-auto p-4 lg:px-8">
          <h1 className="text-center text-[32px] text-white font-sans">
            OneMac - Micro
          </h1>
          <p className="text-center text-white text-2xl font-sans">
            Welcome to the official submission system for paper-based state plan
            ammendments
          </p>
        </div>
      </div>
      {/* End Hero Section */}
      {/* Two Column Main Layout */}
      <h3>State Users</h3>
      <div className="flex">
        <div className="px-4 pb-10 ring-1 ring-cyan-500">CARD</div>
        <div>DETAILS</div>
      </div>
      <h3>CMS Users</h3>
      <div className="flex">
        <div>CARD</div>
        <div>DETAILS</div>
      </div>
    </>
  );
};
