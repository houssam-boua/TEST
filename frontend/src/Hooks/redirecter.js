export const redirectForRole = ({ role }) => {
  switch (role) {
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
