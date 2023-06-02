import { ThreeDots } from "react-loader-spinner";

export const LoadingSpinner = () => {
  return (
    <div className="loader-wrapper">
      <ThreeDots
        height="80"
        width="80"
        radius="9"
        color="#0071bc"
        ariaLabel="three-dots-loading"
        visible={true}
      />
    </div>
  );
};
