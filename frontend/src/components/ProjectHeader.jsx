import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { useApp } from '../context/AppContext';

const ProjectHeader = () => {
    const { projectId } = useParams();
    const { currentProject, isAdmin, canManageTeam, canCreateIssue } = useProject();
    const { openCreateIssueModal } = useApp();


    const projectName = currentProject ? currentProject.project_name : 'Loading...';

    return (
        <header className="bg-white border-b border-gray-200 px-8 h-16 flex items-center justify-between shadow-sm z-20 sticky top-0">
            <div className="flex items-center h-full">
                {/* Breadcrumbs or Context Info */}
                 <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Projects / {currentProject?.project_prefix}</span>
                       <h1 className="text-xl font-bold text-gray-900 flex-shrink-0">
                           {projectName}
                       </h1>
                 </div>

                 {/* Search Bar could go here */}
            </div>

            {/* Create Issue - Right Aligned */}
            {canCreateIssue && (
                <button
                    onClick={() => openCreateIssueModal(projectId)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded transition-colors shadow-sm ml-4"
                >
                    Create Issue
                </button>
            )}
        </header>
    );
};

export default ProjectHeader;
