import React from "react";
import { useNavigate } from "react-router-dom";
import UserDashboardSectionCards from "../components/blocks/userdashboardsectioncards";

const UserDashboard = () => {
  const navigate = useNavigate();

  // Handler to open documents when clicked in the dashboard
  const handleOpenFolder = (doc) => {
    if (doc?.id) {
      navigate(`/edit-document/${doc.id}`);
    }
  };

  return (
    // Added background gradient for better visual depth
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        {/* The section cards component handles the header "Welcome back..." internally */}
        <UserDashboardSectionCards onOpenFolder={handleOpenFolder} />
      </div>
    </div>
  );
};

export default UserDashboard;