import React, { useState, ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Sidebar, Input } from '@rewind-ui/core';

interface BaseLayoutProps {
  children: ReactNode;
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        expanded={sidebarOpen}
        className="min-h-screen"
      >
        <div className="p-4">
          <img src="/Logo.svg" alt="Logo" className="h-8 w-auto" />
        </div>
        
        {/* Navigation links will be rendered by role-specific layouts */}
        
        <Button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute bottom-4 right-4"
          variant="secondary"
          size="sm"
        >
          {sidebarOpen ? '←' : '→'}
        </Button>
      </Sidebar>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <nav className="bg-white shadow-sm">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex-1 flex items-center">
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full max-w-lg"
                />
              </div>
              <div className="flex items-center">
                <img src="/logo-small.png" alt="Logo" className="h-8 w-auto" />
              </div>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
