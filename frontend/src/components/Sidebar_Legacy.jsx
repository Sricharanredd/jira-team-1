import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import api from '../api/api';
import CreateProjectModal from './modals/CreateProjectModal';
import ProjectPopover from './modals/ProjectPopover';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const [projects, setProjects] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProjectPopoverOpen, setIsProjectPopoverOpen] = useState(false);
  const projectButtonRef = useRef(null);
  const location = useLocation();
  const { isSidebarCollapsed, toggleSidebar } = useApp();
  const { currentUser, loading } = useAuth();

  const fetchProjects = async () => {
    try {
      const response = await api.get('/project');
      setProjects(response.data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const isProjectActive = location.pathname.startsWith('/projects');
  const isGlobalAdmin = currentUser?.global_role === 'ADMIN';

  return (
    <div className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-gray-900 text-white h-screen flex flex-col fixed left-0 top-0 overflow-y-auto transition-all duration-300 z-50`}>
      <div className={`p-4 border-b border-gray-700 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isSidebarCollapsed && <h1 className="text-xl font-bold text-white truncate">Jira Clone</h1>}
        <button 
            onClick={toggleSidebar} 
            className="text-gray-400 hover:text-white focus:outline-none p-1 rounded hover:bg-gray-800"
            aria-label="Toggle Sidebar"
        >
            {isSidebarCollapsed ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
            )}
        </button>
      </div>

      <div className="p-4">
        {/* Only Global Admins can create projects */}
        {!loading && isGlobalAdmin && (
            isSidebarCollapsed ? (
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-2 rounded transition duration-200 flex justify-center"
                    title="Create Project"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            ) : (
                <button
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200"
                >
                + Create Project
                </button>
            )
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
         {/* PROJECTS (Opens Popover) */}
         <button
            ref={projectButtonRef}
            onClick={() => setIsProjectPopoverOpen(!isProjectPopoverOpen)}
            className={`w-full text-left flex items-center px-4 py-2 rounded-md transition-colors ${
                isProjectActive ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-300 hover:bg-gray-800'
             } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
            title={isSidebarCollapsed ? "Projects" : ""}
         >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 ${isSidebarCollapsed ? '' : 'mr-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            {!isSidebarCollapsed && "Projects"}
         </button>

         {/* ISSUES (Global Page) */}
         <NavLink
            to="/issues"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-md transition-colors ${
                isActive ? 'bg-blue-800 text-white' : 'text-gray-300 hover:bg-gray-800'
              } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`
            }
            title={isSidebarCollapsed ? "Issues" : ""}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 ${isSidebarCollapsed ? '' : 'mr-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {!isSidebarCollapsed && "Issues"}
         </NavLink>

         {/* CALENDAR */}
         <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-md transition-colors ${
                isActive ? 'bg-blue-800 text-white' : 'text-gray-300 hover:bg-gray-800'
              } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`
            }
            title={isSidebarCollapsed ? "Calendar" : ""}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 ${isSidebarCollapsed ? '' : 'mr-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {!isSidebarCollapsed && "Calendar"}
         </NavLink>

        {/* TIMELINE */}
         <NavLink
            to="/timeline"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-md transition-colors ${
                isActive ? 'bg-blue-800 text-white' : 'text-gray-300 hover:bg-gray-800'
              } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`
            }
            title={isSidebarCollapsed ? "Timeline" : ""}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 ${isSidebarCollapsed ? '' : 'mr-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {!isSidebarCollapsed && "Timeline"}
         </NavLink>

         {/* REPORTS */}
         <NavLink
            to="/reports"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-md transition-colors ${
                isActive ? 'bg-blue-800 text-white' : 'text-gray-300 hover:bg-gray-800'
              } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`
            }
            title={isSidebarCollapsed ? "Reports" : ""}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 ${isSidebarCollapsed ? '' : 'mr-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {!isSidebarCollapsed && "Reports"}
         </NavLink>

         {/* GLOBAL SETTINGS */}
         <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-md transition-colors ${
                isActive ? 'bg-blue-800 text-white' : 'text-gray-300 hover:bg-gray-800'
              } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`
            }
            title={isSidebarCollapsed ? "Global Settings" : ""}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 ${isSidebarCollapsed ? '' : 'mr-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {!isSidebarCollapsed && "Global Settings"}
         </NavLink>
      </nav>



      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onProjectCreated={fetchProjects}
      />
      
      <ProjectPopover
        isOpen={isProjectPopoverOpen}
        onClose={() => setIsProjectPopoverOpen(false)}
        projects={projects}
        anchorRef={projectButtonRef}
      />
    </div>
  );
};



export default Sidebar;
