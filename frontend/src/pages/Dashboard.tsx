import React from 'react';
import { RoleBasedLayout } from '../components/layouts/RoleBasedLayout';

export const Dashboard: React.FC = () => {
  return (
    <RoleBasedLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Add your dashboard content here */}
        </div>
      </div>
    </RoleBasedLayout>
  );
};
