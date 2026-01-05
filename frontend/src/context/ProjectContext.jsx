import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../api/api';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [currentProject, setCurrentProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  
  const location = useLocation();

  const fetchProjectData = useCallback(async (projectId) => {
    if (!projectId) {
        setCurrentProject(null);
        setIssues([]);
        setUserRole(null);
        return;
    }

    setLoading(true);
    setError(null);
    try {
      // Use the Board Data endpoint which returns generic project structure + issues + role
      // This is efficient and provides RBAC info.
      const res = await api.get(`/projects/${projectId}/board`);
      
      const { project, issues: fetchedIssues } = res.data;
      
      setCurrentProject(project);
      setIssues(fetchedIssues);
      
      // Store Current User Role (Normalized to UPPERCASE)
      if (project.currentUserRole) {
          setUserRole(project.currentUserRole.toUpperCase());
      } else {
          // If no project role, check if Global Admin
          // We moved the fallback logic to backend, so project.currentUserRole should return ADMIN if global admin
          // But purely for safety:
           setUserRole(null);
      }

    } catch (err) {
      console.error("Failed to fetch project data", err);
      const status = err.response?.status;
      if (status === 403) {
          setError("Access Denied: You do not have permission to view this project.");
      } else if (status === 404) {
          setError("Project not found.");
      } else {
          setError(err.response?.data?.detail || "Failed to load project");
      }
      setCurrentProject(null);
      setIssues([]);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to sniff URL for projectId
  useEffect(() => {
     const match = location.pathname.match(/^\/projects\/(\d+)/);
     if (match) {
         const pId = match[1];
         // Only fetch if changed
         if (!currentProject || currentProject.id !== parseInt(pId)) {
             fetchProjectData(pId);
         }
     } else {
         // Outside project context? Optional: Clear or Keep last?
         // Let's clear to avoid stale data showing up elsewhere
         if (currentProject) {
            setCurrentProject(null);
            setIssues([]);
         }
     }
  }, [location.pathname, fetchProjectData]); // currentProject in dependency might cause loop if not careful

  const refreshIssues = useCallback(async () => {
     if (currentProject) {
         fetchProjectData(currentProject.id);
     }
  }, [currentProject, fetchProjectData]);

  // Derived State Helpers
  const epics = issues.filter(i => i.issue_type === 'epic');
  // Backlog issues: No sprint assigned (Regardles of status, though status usually is backlog)
  const backlogIssues = issues.filter(i => i.issue_type !== 'epic' && !i.sprint_number);
  
  // Derived Role Flags (Safe Usage)
  const isAdmin = userRole === 'ADMIN';
  const isScrumMaster = userRole === 'SCRUM_MASTER';
  const isDeveloper = userRole === 'DEVELOPER';
  const isTester = userRole === 'TESTER';
  const isViewer = userRole === 'VIEWER';

  // Permission Matrix
  const canCreateIssue = isAdmin || isScrumMaster || isDeveloper || isTester;
  const canManageTeam = isAdmin || isScrumMaster;
  const canChangeStatus = isAdmin || isScrumMaster || isDeveloper || isTester;
  const isReadOnly = isViewer;
  
  return (
    <ProjectContext.Provider value={{
      currentProject,
      issues,
      epics,
      backlogIssues,
      loading,
      error,
      refreshIssues,
      fetchProjectData,
      userRole,
      isAdmin,
      isScrumMaster, 
      isDeveloper,
      isTester,
      isViewer,
      canCreateIssue,
      canManageTeam,
      canChangeStatus,
      isReadOnly
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error("useProject must be used within a ProjectProvider");
    }
    return context;
};
