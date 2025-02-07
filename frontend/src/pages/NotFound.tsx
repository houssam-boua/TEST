import React from 'react';
import { Link } from 'react-router-dom';
import { BaseLayout } from '../components/layouts/BaseLayout';

export const NotFound: React.FC = () => {
  return (
    <BaseLayout>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-lg mb-4">Page not found</p>
        <Link
          to="/"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </BaseLayout>
  );
};
