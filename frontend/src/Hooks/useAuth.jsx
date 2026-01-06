// hooks/useAuth.js
import { useSelector } from "react-redux";
import {
  selectCurrentUser,
  selectToken,
  selectIsAuthenticated,
  selectIsLoading,
  selectError,
  selectIsAdmin,
  selectUserRole,
  selectUserRoleName,
  selectUserDepartment,
  selectUserDepartmentName,
  selectUserFullName,
  selectUserId,
  selectUsername,
  selectUserEmail,
} from "@/slices/authSlice";

export const useAuth = () => {
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const isAdmin = useSelector(selectIsAdmin);
  const role = useSelector(selectUserRole);
  const roleName = useSelector(selectUserRoleName);
  const department = useSelector(selectUserDepartment);
  const departmentName = useSelector(selectUserDepartmentName);
  const fullName = useSelector(selectUserFullName);
  const userId = useSelector(selectUserId);
  const username = useSelector(selectUsername);
  const email = useSelector(selectUserEmail);

  return {
    // User data
    user,
    userId,
    username,
    email,
    fullName,
    
    // Auth state
    token,
    isAuthenticated,
    isLoading,
    error,
    
    // Role & permissions
    isAdmin,
    role,
    roleName,
    department,
    departmentName,
    
    // Helper methods
    hasRole: (targetRole) => {
      if (!role) return false;
      return role.role_name === targetRole;
    },
    
    hasPermission: (permission) => {
      if (!user) return false;
      const permissions = user.permissions || [];
      return permissions.includes(permission);
    },
    
    hasAnyRole: (...roles) => {
      if (!role) return false;
      return roles.includes(role.role_name);
    },
    
    belongsToDepartment: (deptName) => {
      if (!department) return false;
      return department.dep_name === deptName;
    },
  };
};

export default useAuth;
