const useIcon = (
  status,
  color = "text-gray-500",
  Icon = null,
  className = "h-3 w-3"
) => {
  // Icon should be a React component (e.g. FileText). Render it with provided className + color.
  if (!Icon) return null;

  const Combined = Icon;
  switch (status) {
    case "approved":
    case "pending":
    case "rejected":
      return <Combined className={`${className} ${color}`} strokeWidth={0.75} />;
    default:
      return <Combined className={`${className} ${color}`} strokeWidth={0.75} size={20} />;
  }
};

export default useIcon;
