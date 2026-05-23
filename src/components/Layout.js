import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import '../styles/layout.css';

const Layout = ({ onLogout, userEmail, currentUser }) => {
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <div className="layout-container">
      <Sidebar isOpen={isOpen} onLogout={onLogout} />
      {/* overlay for mobile when sidebar open */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar} />
      )}
      <div className={`main-content ${isOpen ? 'sidebar-open' : ''}`}> 
        <Navbar toggleSidebar={toggleSidebar} onLogout={onLogout} userEmail={userEmail} currentUser={currentUser} />
        <div className="outlet">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
