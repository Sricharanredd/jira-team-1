import React, { useEffect, useState } from 'react';
import { NavLink, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useProject } from '../../context/ProjectContext';
import api from '../../api/api';

const ProjectSidebar = () => {
  const { projectId } = useParams();
  const { isSidebarCollapsed, toggleSidebar } = useApp();
  const { currentProject } = useProject();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation Items
  const navItems = [
    { name: 'Board', path: `/projects/${projectId}`, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />, exact: true },

    { name: 'Backlog', path: `/projects/${projectId}/backlog`, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /> },
    { name: 'Issues', path: `/projects/${projectId}/issues`, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /> },

    { name: 'Reports', path: `/projects/${projectId}/reports`, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
    { name: 'Calendar', path: `/projects/${projectId}/calendar`, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
    { name: 'Timeline', path: `/projects/${projectId}/timeline`, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    { name: 'Settings', path: `/projects/${projectId}/settings`, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /> },
  ];


  return (
    <div className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-[#0F172A] text-white h-screen flex flex-col fixed left-0 top-0 transition-all duration-300 z-50`}>
      {/* Back to Workspace */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {!isSidebarCollapsed && <span className="text-xs uppercase font-bold tracking-wider">Back to Projects</span>}
        </button>

        <div className="flex items-center justify-between">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-lg">
                {currentProject?.project_name?.charAt(0) || 'P'}
              </div>
              <div className="overflow-hidden">
                <h1 className="font-bold text-white truncate">{currentProject?.project_name}</h1>
                <span className="text-xs text-gray-400">{currentProject?.project_prefix}</span>
              </div>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isSidebarCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Nav Items */}


      <nav className="flex-1 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => {
              const searchParams = new URLSearchParams(location.search);
              const context = searchParams.get('context');

              // Context Override Logic: If context logic is present, IT IS THE TRUTH. Ignore isActive.
              if (context) {
                let isContextActive = false;
                if (context === 'board' && item.name === 'Board') isContextActive = true;
                if (context === 'backlog' && item.name === 'Backlog') isContextActive = true;
                if (context === 'issues' && item.name === 'Issues') isContextActive = true;
                if (context === 'reports' && item.name === 'Reports') isContextActive = true;
                if (context === 'calendar' && item.name === 'Calendar') isContextActive = true;
                if (context === 'timeline' && item.name === 'Timeline') isContextActive = true;

                return `flex items-center px-4 py-3 transition-colors border-l-4 ${isContextActive
                  ? 'bg-gray-800 border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`;
              }

              // Fallback: Standard pathname check
              const activeState = isActive || (item.exact && location.pathname === item.path);

              return `flex items-center px-4 py-3 transition-colors border-l-4 ${activeState
                ? 'bg-gray-800 border-blue-500 text-white'
                : 'border-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`;
            }}
            end={item.exact}
            title={item.name}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {item.icon}
            </svg>
            {!isSidebarCollapsed && <span className="ml-3 font-medium">{item.name}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default ProjectSidebar;
