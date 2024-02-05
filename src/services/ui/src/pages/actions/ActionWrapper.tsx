import { Outlet } from "react-router-dom";

export const ActionWrapper = () => {
  return (
    <main>
      <div>Breadcrumbs will go here</div>
      <Outlet />
    </main>
  );
};
