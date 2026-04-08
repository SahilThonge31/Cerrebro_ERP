import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';


const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-grow bg-gray-50">
        {/* --- CHANGE: Added a container to wrap the page content --- */}
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* The Outlet now renders inside this centered and padded container */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;