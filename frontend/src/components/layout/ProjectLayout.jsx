import React, { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import ProjectSidebar from './ProjectSidebar';
import ProjectHeader from '../ProjectHeader';
import { useApp } from '../../context/AppContext';
import { useProject } from '../../context/ProjectContext';

const ProjectLayout = () => {
    const { isSidebarCollapsed } = useApp();
    const { projectId } = useParams();
    const { fetchProjectData } = useProject();

    // Ensure we load the project context when mounting this layout
    useEffect(() => {
        if (projectId) {
            fetchProjectData(projectId);
        }
    }, [projectId, fetchProjectData]);
    
    return (
        <div className="h-full">
            <ProjectSidebar />
            <div className={`h-full flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
                 <ProjectHeader />
                 <main className="flex-1 overflow-auto relative">
                    <Outlet />
                 </main>
            </div>
        </div>
    );
};

export default ProjectLayout;
