import React from 'react';
import { Outlet } from 'react-router-dom';
import GlobalSidebar from './GlobalSidebar';
import { useApp } from '../../context/AppContext';

const WorkspaceLayout = () => {
    const { isSidebarCollapsed } = useApp();
    
    return (
        <div className="h-full">
            <GlobalSidebar />
            <div className={`h-full flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
                 <main className="flex-1 overflow-auto relative">
                    <Outlet />
                 </main>
            </div>
        </div>
    );
};

export default WorkspaceLayout;
