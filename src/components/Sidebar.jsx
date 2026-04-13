import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileWarning, ListTodo, Settings, LogOut } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ onLogout, role }) => {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-icon">
                    <LayoutDashboard size={24} color="#ffffff" />
                </div>
                <div className="brand-titles">
                    <div className="brand-text">CivicSense AI</div>
                    <div className={`role-badge role-${role}`}>
                        {role === 'official' ? 'Gov. Official' : 'Citizen'}
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            <LayoutDashboard size={20} />
                            <span>{role === 'official' ? 'City Analytics' : 'Dashboard'}</span>
                        </NavLink>
                    </li>
                    {role === 'citizen' && (
                        <li>
                            <NavLink to="/report" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                <FileWarning size={20} />
                                <span>Report Issue</span>
                            </NavLink>
                        </li>
                    )}
                    <li>
                        <NavLink to="/track" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                            <ListTodo size={20} />
                            <span>{role === 'official' ? 'Manage Intake Queue' : 'Track Issues'}</span>
                        </NavLink>
                    </li>
                </ul>
            </nav>

            <div className="sidebar-footer">
                <ul>
                    <li>
                        <a href="#" className="nav-link">
                            <Settings size={20} />
                            <span>Settings</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" className="nav-link logout" onClick={(e) => { e.preventDefault(); onLogout(); }}>
                            <LogOut size={20} />
                            <span>Log Out</span>
                        </a>
                    </li>
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;
