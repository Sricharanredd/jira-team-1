import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar_Legacy';
import Header from './Header';
import CreateStoryModal from './modals/CreateStoryModal';
import { useApp } from '../context/AppContext';

const Layout = () => {
    const { isCreateIssueModalOpen, closeCreateIssueModal, createIssueProjectId, isSidebarCollapsed } = useApp();

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            <Sidebar />
            <main className={`flex-1 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} h-full flex flex-col overflow-hidden transition-all duration-300`}>
                <Header />
                
                <div className="flex-1 overflow-y-auto relative min-h-0">
                    <Outlet />
                </div>

                <CreateStoryModal 
                    isOpen={isCreateIssueModalOpen}
                    onClose={closeCreateIssueModal}
                    projectId={createIssueProjectId}
                    onStoryCreated={() => {
                        window.dispatchEvent(new Event('story-created'));
                    }}
                />
            </main>
        </div>
    );
};

export default Layout;
