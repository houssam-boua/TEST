const useIcon = (
  status,
  color = "text-gray-500",
  Icon = null,
  className = "h-5 w-5"
) => {
  // Icon should be a React component (e.g. FileText). Render it with provided className + color.
  if (!Icon) return null;

  const Combined = Icon;
  switch (status) {
    case "approved":
    case "pending":
    case "rejected":
      return <Combined className={`${className} ${color}`} />;
    default:
      return <Combined className={`${className} ${color}`} />;
  }
};

export default useIcon;
