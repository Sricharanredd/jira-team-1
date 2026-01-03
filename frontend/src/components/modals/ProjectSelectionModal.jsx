import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const ProjectSelectionModal = ({ isOpen, onClose, projects }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSelectProject = (projectId) => {
    navigate(`/projects/${projectId}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[400px] shadow-xl">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Select Project</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {projects.length === 0 ? (
             <p className="text-gray-500 italic text-center py-4">You are not part of any projects yet.</p>
          ) : (
            projects.map((project) => (
                <button
                key={project.id}
                onClick={() => handleSelectProject(project.id)}
                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors border border-gray-100 flex justify-between items-center group"
                >
                    <span className="font-semibold">{project.project_name}</span>
                    <span className="text-xs text-gray-400 group-hover:text-blue-400">{project.project_prefix}</span>
                </button>
            ))
          )}
        </div>

        <div className="mt-4 pt-4 border-t flex justify-end">
            <button 
                onClick={onClose}
                className="text-gray-500 text-sm hover:underline"
            >
                Cancel
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSelectionModal;
