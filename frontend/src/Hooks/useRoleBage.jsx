import React from "react";
import { Badge } from "@/components/ui/badge";
import { 
  CheckLine, 
  PenLine, 
  User, 
  Shield,
  Eye,
  Upload,
  Tag
} from "lucide-react";

const useRoleBadge = ({ role }) => {
  // ✅ Extract role data (name and color from database)
  let roleName = "Unknown";
  let roleColor = "#6b7280"; // Default gray
  
  if (typeof role === 'string') {
    roleName = role;
  } else if (role && role.role_name) {
    roleName = role.role_name;
    roleColor = role.role_color || "#6b7280";
  }
  
  // If no role data, show Unknown badge
  if (!role || roleName === "Unknown") {
    return (
      <Badge className="bg-gray-600/10 dark:bg-gray-600/20 hover:bg-gray-600/10 text-gray-500 shadow-none rounded-full">
        <div className="h-1.5 w-1.5 rounded-full bg-gray-500 mr-2" />
        Unknown
      </Badge>
    );
  }
  
  // ✅ Icon mapping (optional - keeps nice icons for known roles)
  const roleKey = roleName.toLowerCase();
  const iconMap = {
    admin: User,
    author: PenLine,
    reviewer: Eye,
    approver: Shield,
    publisher: Upload,
    validator: CheckLine,
    user: User,
  };
  
  // Use mapped icon or default Tag icon for new roles
  const Icon = iconMap[roleKey] || Tag;
  
  // ✅ Convert color name to hex if needed
  const getColorValue = (color) => {
    const colorMap = {
      'black': '#000000',
      'white': '#ffffff',
      'gray': '#6b7280',
      'red': '#ef4444',
      'blue': '#3b82f6',
      'green': '#10b981',
      'yellow': '#f59e0b',
      'purple': '#8b5cf6',
      'pink': '#ec4899',
      'indigo': '#6366f1',
      'orange': '#f97316',
    };
    
    // If it's already a hex color, return it
    if (color.startsWith('#')) return color;
    
    // If it's a named color, convert it
    return colorMap[color.toLowerCase()] || color;
  };
  
  const hexColor = getColorValue(roleColor);
  
  // ✅ Dynamic rendering with database color and name
  return (
    <span className="rounded-full pl-1 gap-1.5 flex items-center">
      <Icon 
        className="h-4 w-4" 
        style={{ 
          stroke: hexColor,
          opacity: 0.8 
        }}
      />
      <span 
        className="font-medium capitalize"
        style={{ color: hexColor }}
      >
        {roleName}
      </span>
    </span>
  );
};

export default useRoleBadge;
