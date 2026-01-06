import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Sidebar.css';

function Sidebar() {
  const { logout } = useContext(AuthContext);

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-title">EMS</div>
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
        <NavLink to="/employees" className={({ isActive }) => isActive ? 'active' : ''}>Employees</NavLink>
        <NavLink to="/attendance" className={({ isActive }) => isActive ? 'active' : ''}>Attendance</NavLink>
        <NavLink to="/payroll" className={({ isActive }) => isActive ? 'active' : ''}>Payroll</NavLink>
      <div className="sidebar-spacer" />
      <a href="#" onClick={handleLogout} className="logout-link">Logout</a>
    </nav>
  );
}

export default Sidebar; 