import { CircleAlert } from "lucide-react";

const useIcon = (status) => {
  switch (status) {
    case "approved":
      return <CircleAlert />;
    case "pending":
      return <CircleAlert />;
    case "rejected":
      return <CircleAlert />;
    default:
      return null;
  }
};

export default useIcon;
