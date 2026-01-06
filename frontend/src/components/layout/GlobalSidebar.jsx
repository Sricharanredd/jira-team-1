import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const GlobalSidebar = () => {
  const { isSidebarCollapsed, toggleSidebar } = useApp();
  const location = useLocation();

  return (
    <div className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-[#0F172A] text-white h-screen flex flex-col fixed left-0 top-0 transition-all duration-300 z-50`}>
      {/* Header / Toggle */}
      <div className={`p-4 border-b border-gray-700 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isSidebarCollapsed && <h1 className="text-xl font-bold flex items-center gap-2"><div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">J</div> Jira Clone</h1>}
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

      {/* Nav Items */}
      <nav className="flex-1 py-4 space-y-1">
        {/* Projects (Home) */}
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            `flex items-center px-4 py-3 transition-colors border-l-4 ${isActive ? 'bg-gray-800 border-blue-500 text-white' : 'border-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`
          }
          title="Projects"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          {!isSidebarCollapsed && <span className="ml-3 font-medium">Projects</span>}
        </NavLink>

        {/* Assigned to Me */}
        <NavLink
          to="/assigned-to-me"
          className={({ isActive }) => {
            const searchParams = new URLSearchParams(location.search);
            const context = searchParams.get('context');

            // Strict Priority: If context is present, ignore isActive
            if (context) {
              const isContextActive = context === 'assigned_to_me';
              return `flex items-center px-4 py-3 transition-colors border-l-4 ${isContextActive ? 'bg-gray-800 border-blue-500 text-white' : 'border-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`;
            }

            // Fallback: Default URL matching
            const activeState = isActive;

            return `flex items-center px-4 py-3 transition-colors border-l-4 ${activeState ? 'bg-gray-800 border-blue-500 text-white' : 'border-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`;
          }}
          title="Assigned to Me"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {!isSidebarCollapsed && <span className="ml-3 font-medium">Assigned to me </span>}
        </NavLink>

        {/* Global Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 transition-colors border-l-4 ${isActive ? 'bg-gray-800 border-blue-500 text-white' : 'border-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`
          }
          title="Global Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {!isSidebarCollapsed && <span className="ml-3 font-medium">Global Settings</span>}
        </NavLink>
      </nav>

      {/* User Info Bottom - REMOVED as per requirements */}
    </div>
  );
};

export default GlobalSidebar;
