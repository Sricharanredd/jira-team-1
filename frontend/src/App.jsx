import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Board from './components/Board';
import BacklogView from './components/BacklogView';
import GlobalIssuesPage from './pages/GlobalIssuesPage';
import StoryDetailPage from './pages/StoryDetailPage';
import ReportsPage from './pages/ReportsPage';
import ProjectReports from './pages/ProjectReports';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
// import Register from './pages/Register';
import ProfilePage from './pages/ProfilePage';
import ProjectSettings from './pages/ProjectSettings';
import ProjectIssuesPage from './pages/ProjectIssuesPage';
import ProtectedRoute from './components/ProtectedRoute';
import Signup from './pages/Signup';

import { AppProvider } from './context/AppContext';
import { ProjectProvider } from './context/ProjectContext';
import { AuthProvider } from './context/AuthContext';
import CalendarPage from './pages/CalendarPage';
import TimelinePage from './pages/TimelinePage';
import GlobalSettingsPage from './pages/GlobalSettingsPage';

import AssignedToMePage from './pages/AssignedToMePage';

// Inner App Component
import Workspace from './pages/Workspace';
import WorkspaceLayout from './components/layout/WorkspaceLayout';
import ProjectLayout from './components/layout/ProjectLayout';
const AppContent = () => {
    return (

        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            {/* <Route path="/register" element={<Register />} /> */}
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes */}
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>

                {/* GLOBAL WORKSPACE LAYOUT */}
                <Route element={<WorkspaceLayout />}>
                    <Route path="/dashboard" element={<Workspace />} />
                    <Route path="/assigned-to-me" element={<AssignedToMePage />} />
                    <Route path="/settings" element={<GlobalSettingsPage />} />
                    {/* Fallback global routes if any */}
                </Route>

                {/* PROJECT LAYOUT */}
                <Route path="/projects/:projectId" element={<ProjectLayout />}>
                    <Route index element={<Board />} />
                    <Route path="backlog" element={<BacklogView />} />
                    <Route path="reports" element={<ProjectReports />} />
                    <Route path="settings" element={<ProjectSettings />} />
                    <Route path="issues" element={<ProjectIssuesPage />} />
                    <Route path="calendar" element={<CalendarPage />} />
                    <Route path="timeline" element={<TimelinePage />} />
                    <Route path="issues/:id" element={<StoryDetailPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                </Route>

                {/* Standalone Pages (Profile, etc) - Wrap in WorkspaceLayout or Keep Separate? */}
                <Route element={<WorkspaceLayout />}>
                    <Route path="/profile" element={<ProfilePage />} />
                    {/* Global Issues/Reports were requested to be REMOVED from sidebar, 
                         but keeping routes accessible just in case, wrapped in Workspace layout 
                         so they have the global sidebar.
                      */}
                    <Route path="/issues" element={<GlobalIssuesPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                </Route>

            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppProvider>
                    <ProjectProvider>
                        <AppContent />
                    </ProjectProvider>
                </AppProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
