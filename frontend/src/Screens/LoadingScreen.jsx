import React from "react";
import SpinnerCircle2 from "../Components/spinner-08";

const LoadingScreen = () => {
  return (
    <div className="absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center">
      <SpinnerCircle2 />
    </div>
  );
};

export default LoadingScreen;
