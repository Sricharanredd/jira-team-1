import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header';
import { useApp } from '../../context/AppContext';
import CreateStoryModal from '../modals/CreateStoryModal';

const MainLayout = () => {
    const { isCreateIssueModalOpen, closeCreateIssueModal, createIssueProjectId } = useApp();

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[#F4F5F7]">
            {/* Global Top Header */}
            <Header />

            {/* Main Content Area (Layouts render here) */}
            <div className="flex-1 overflow-hidden relative">
                <Outlet />
            </div>

            {/* Global Modals */}
            <CreateStoryModal 
                isOpen={isCreateIssueModalOpen}
                onClose={closeCreateIssueModal}
                projectId={createIssueProjectId}
                onStoryCreated={() => {
                    window.dispatchEvent(new Event('story-created'));
                }}
            />
        </div>
    );
};

export default MainLayout;
