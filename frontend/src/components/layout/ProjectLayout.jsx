import React, { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import ProjectSidebar from './ProjectSidebar';
import ProjectHeader from '../ProjectHeader';
import { useApp } from '../../context/AppContext';
import { useProject } from '../../context/ProjectContext';
import Toast from '../Toast';

const ProjectLayout = () => {
    const { isSidebarCollapsed } = useApp();
    const { projectId } = useParams();
    const { fetchProjectData, refreshIssues } = useProject();
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Ensure we load the project context when mounting this layout
    useEffect(() => {
        if (projectId) {
            fetchProjectData(projectId);
        }
    }, [projectId, fetchProjectData]);

    // Global Toast Listener
    useEffect(() => {
        const handleStoryCreated = () => {
            refreshIssues();
            setToast({ show: true, message: 'Story created successfully!', type: 'success' });
        };
        const handleStoryUpdated = () => refreshIssues(); // Just refresh, no toast for now

        window.addEventListener('story-created', handleStoryCreated);
        window.addEventListener('story-updated', handleStoryUpdated);

        return () => {
            window.removeEventListener('story-created', handleStoryCreated);
            window.removeEventListener('story-updated', handleStoryUpdated);
        };
    }, [refreshIssues]);

    return (
        <div className="h-full">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
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
