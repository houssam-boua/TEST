import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BaseLayout } from './BaseLayout';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@rewind-ui/core';

interface NavLink {
  label: string;
  path: string;
  icon?: string;
}

const roleNavLinks: Record<string, NavLink[]> = {
  admin: [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Users', path: '/admin/users' },
    { label: 'Settings', path: '/admin/settings' },
  ],
  manager: [
    { label: 'Dashboard', path: '/manager' },
    { label: 'Team', path: '/manager/team' },
    { label: 'Reports', path: '/manager/reports' },
  ],
  user: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Profile', path: '/profile' },
    { label: 'Tasks', path: '/tasks' },
  ],
};

interface RoleBasedLayoutProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'manager' | 'user';
}

export const RoleBasedLayout: React.FC<RoleBasedLayoutProps> = ({
  children,
  requiredRole,
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  const navLinks = user ? roleNavLinks[user.role] : [];

  return (
    <BaseLayout>
      <div className="flex flex-col h-full">
        <div className="flex-1">
          {navLinks.map((link) => (
            <Link to={link.path} key={link.path} className="block w-full">
              <Button
                variant="primary"
                className="w-full text-left mb-2"
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </div>
        {children}
      </div>
    </BaseLayout>
  );
};
