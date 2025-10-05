export const redirectForRole = ({ role }) => {
  switch ((role || "").toLowerCase()) {
    case "admin":
      return "/a/acceuil";
    case "validator":
      return "/v/acceuil";
    case "user":
      return "/u/acceuil";
    default:
      return "/login";
  }
};

export default redirectForRole;
