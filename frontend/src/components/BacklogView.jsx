import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { updateUserStoryStatus } from '../api/api';
import { useProject } from '../context/ProjectContext';
import ProjectHeader from './ProjectHeader';

const BacklogView = () => {
    const { projectId } = useParams();

    // Context Data
    const {
        issues: tasks,
        epics,
        backlogIssues,
        loading,
        currentProject,
        refreshIssues,
        canChangeStatus
    } = useProject();



    // Safe derivation
    const canEdit = canChangeStatus;
    const projectName = currentProject ? currentProject.project_name : '';

    // Listen for global story creation events (Just refresh issues now, toast handled globally)
    // Actually ProjectLayout handles refresh too, but keeping it here ensures local reactiveness if layout doesn't trigger context update fast enough? 
    // No, useProject shares state. If ProjectLayout calls refreshIssues, context updates, this re-renders.
    // But keeping listeners here is fine/safe redundancy or we can remove. 
    // Let's remove listeners to avoid double refresh, or keep purely primarily for safety.
    // ProjectLayout handles it. Remove.

    const handleMoveToBoard = async (task) => {
        try {
            if (task.sprint_number) {
                await updateUserStoryStatus(task.id, 'todo');
            } else {
                // Prompt user for Sprint Number
                const sprintInput = window.prompt("Enter Sprint Number for this issue:", "1");

                if (!sprintInput) return; // Cancelled

                // If missing sprint, fetch full details and assign provided sprint
                const { data: fullStory } = await api.get(`/user-story/${task.id}`);
                const data = new FormData();
                data.append('title', fullStory.title);
                data.append('assignee', fullStory.assignee || '');
                data.append('reviewer', fullStory.reviewer || '');
                data.append('description', fullStory.description || '');
                data.append('status', 'todo');
                data.append('sprint_number', sprintInput);
                data.append('start_date', fullStory.start_date || '');
                data.append('end_date', fullStory.end_date || '');
                data.append('parent_issue_id', fullStory.parent_issue_id || '');

                await api.put(`/user-story/${task.id}`, data);
            }
            refreshIssues();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.detail || "Failed to move to board");
        }
    };

    if (loading && tasks.length === 0) return <div className="p-10 text-center text-gray-500">Loading backlog...</div>;

    const IssueTable = ({ issues, showMoveAction }) => (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    {showMoveAction && canEdit && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>}
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {issues.map(task => (
                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                            <Link to={`/projects/${projectId}/issues/${task.id}?context=backlog`} className="hover:text-blue-600">
                                {task.story_code || `ID-${task.id}`}
                            </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border ${task.issue_type === 'epic' ? 'bg-purple-50 text-purple-600 border-purple-200' : task.issue_type === 'bug' ? 'bg-red-50 text-red-600 border-red-200' : task.issue_type === 'task' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                                {task.issue_type || 'story'}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                            <Link to={`/projects/${projectId}/issues/${task.id}?context=backlog`} className="hover:text-blue-600 hover:underline">
                                {task.title}
                            </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {task.assignee}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {task.status.replace('_', ' ')}
                        </td>
                        {showMoveAction && canEdit && (
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => handleMoveToBoard(task)}
                                    className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-xs transition-colors"
                                >
                                    Move to Board
                                </button>
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table >
    );

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header Removed (Handled by Layout) */}

            <div className="flex-1 overflow-auto p-8 flex flex-col gap-8">
                {/* Epics Section */}
                <div>
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded bg-purple-600"></span>
                        Epics
                    </h3>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {epics.length === 0 ? (
                            <div className="p-6 text-center text-gray-400 italic text-sm">No epics found</div>
                        ) : (
                            <IssueTable issues={epics} showMoveAction={false} />
                        )}
                    </div>
                </div>

                {/* Backlog Issues Section */}
                <div>
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded bg-blue-500"></span>
                        Backlog Issues
                    </h3>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {backlogIssues.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 italic text-sm">No issues in backlog</div>
                        ) : (
                            <IssueTable issues={backlogIssues} showMoveAction={true} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BacklogView;
