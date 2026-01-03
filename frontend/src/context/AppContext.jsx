import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isCreateIssueModalOpen, setIsCreateIssueModalOpen] = useState(false);
  const [createIssueProjectId, setCreateIssueProjectId] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  const openCreateIssueModal = (projectId = null) => {
    setCreateIssueProjectId(projectId);
    setIsCreateIssueModalOpen(true);
  };

  const closeCreateIssueModal = () => {
    setIsCreateIssueModalOpen(false);
    setCreateIssueProjectId(null);
  };

  return (
    <AppContext.Provider value={{ 
      isCreateIssueModalOpen, 
      openCreateIssueModal, 
      closeCreateIssueModal,
      createIssueProjectId,
      isSidebarCollapsed,
      toggleSidebar
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
