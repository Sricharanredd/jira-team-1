import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { NavLink } from 'react-router-dom';

const ProjectPopover = ({ isOpen, onClose, projects, anchorRef }) => {
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(event.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  // Calculate position: right of anchor
  const style = {
      position: 'fixed',
      top: anchorRef.current ? anchorRef.current.getBoundingClientRect().top : 0,
      left: anchorRef.current ? anchorRef.current.getBoundingClientRect().right + 10 : 250, // 10px spacing
      zIndex: 9999, // Ensure it's on top of everything
  };

  return ReactDOM.createPortal(
    <div 
        ref={popoverRef}
        style={style}
        className="w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-fade-in-up"
    >
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Project</h3>
      </div>
      <div className="max-h-[300px] overflow-y-auto py-1">
        {projects.length === 0 ? (
            <p className="px-4 py-2 text-sm text-gray-500 italic">No projects found.</p>
        ) : (
            projects.map(project => (
                <NavLink
                    key={project.id}
                    to={`/projects/${project.id}`}
                    onClick={onClose}
                    className={({ isActive }) => `block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${isActive ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                >
                    {project.project_name}
                </NavLink>
            ))
        )}
      </div>
    </div>,
    document.body
  );
};

export default ProjectPopover;
