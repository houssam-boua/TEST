import { CircleAlert } from "lucide-react";

const useIcon = (status,color ) => {
  switch (status) {
    case "approved":
      return <CircleAlert className={`${color}`} />;
    case "pending":
      return <CircleAlert className={`${color}`} />;
    case "rejected":
      return <CircleAlert className={`${color}`} />;
    default:
      return null;
  }
};

export default useIcon;
