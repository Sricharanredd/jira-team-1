import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';

const ProjectTabs = ({ activeTab }) => {
  const { projectId } = useParams();
  const { isAdmin, isMember } = useProject();
  
  // Tabs: Board | Backlog | Reports | Settings (Admin only)
  const tabs = [
    { name: 'Board', path: `/projects/${projectId}`, exact: true },
    { name: 'Backlog', path: `/projects/${projectId}/backlog` },
    { name: 'Issues', path: `/projects/${projectId}/issues` },
    { name: 'Reports', path: `/projects/${projectId}/reports` },
  ];

  if (isAdmin) {
      tabs.push({ name: 'Settings', path: `/projects/${projectId}/settings` });
  }

  return (
    <div className="border-b border-gray-200 mb-6 bg-white z-10 sticky top-0">
      <nav className="-mb-px flex space-x-8 px-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <NavLink
            key={tab.name}
            to={tab.path}
            end={tab.exact}
            className={({ isActive }) =>
              `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            }
          >
            {tab.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default ProjectTabs;
