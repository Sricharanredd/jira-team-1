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

    const [expandedEpics, setExpandedEpics] = useState({});

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
            await updateUserStoryStatus(task.id, 'todo');
            refreshIssues();
        } catch (error) {
            alert(error.response?.data?.detail || "Failed to move to board");
        }
    };

    const toggleEpic = (epicId) => {
        setExpandedEpics(prev => ({
            ...prev,
            [epicId]: !prev[epicId]
        }));
    };

    if (loading && tasks.length === 0) return <div className="p-10 text-center text-gray-500">Loading backlog...</div>;

    const IssueTable = ({ issues, showMoveAction }) => (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></th>
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
                    <React.Fragment key={task.id}>
                        <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                {task.issue_type === 'epic' && (
                                    <button
                                        onClick={() => toggleEpic(task.id)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform ${expandedEpics[task.id] ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                                {task.issue_type === 'epic' ? (
                                    <button
                                        onClick={() => toggleEpic(task.id)}
                                        className="hover:text-blue-600 hover:underline text-left"
                                    >
                                        {task.story_code || `ID-${task.id}`}
                                    </button>
                                ) : (
                                    <Link to={`/projects/${projectId}/issues/${task.id}?context=backlog`} className="hover:text-blue-600">
                                        {task.story_code || `ID-${task.id}`}
                                    </Link>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border ${task.issue_type === 'epic' ? 'bg-purple-50 text-purple-600 border-purple-200' : task.issue_type === 'bug' ? 'bg-red-50 text-red-600 border-red-200' : task.issue_type === 'task' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                                    {task.issue_type || 'story'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                {task.issue_type === 'epic' ? (
                                    <button
                                        onClick={() => toggleEpic(task.id)}
                                        className="hover:text-blue-600 hover:underline text-left font-medium"
                                    >
                                        {task.title}
                                    </button>
                                ) : (
                                    <Link to={`/projects/${projectId}/issues/${task.id}?context=backlog`} className="hover:text-blue-600 hover:underline">
                                        {task.title}
                                    </Link>
                                )}
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
                        {/* Expandable Child Row */}
                        {task.issue_type === 'epic' && expandedEpics[task.id] && (
                            <tr className="bg-gray-50/50">
                                <td colSpan={7} className="px-6 py-4 pl-16">
                                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                            <span>Child Issues</span>
                                            <span className="text-gray-400 font-normal">({tasks.filter(t => String(t.parent_issue_id) === String(task.id)).length})</span>
                                        </h4>
                                        <div className="space-y-2">
                                            {tasks.filter(t => String(t.parent_issue_id) === String(task.id)).length > 0 ? (
                                                tasks.filter(t => String(t.parent_issue_id) === String(task.id)).map(child => (
                                                    <div key={child.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-100 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${child.status === 'done' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                                            <Link to={`/projects/${projectId}/issues/${child.id}?context=backlog`} className="text-sm text-gray-700 font-medium hover:text-blue-600">
                                                                {child.story_code} - {child.title}
                                                            </Link>
                                                        </div>
                                                        <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded">{child.status}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-sm text-gray-400 italic">No child stories found.</div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))}
            </tbody>
        </table>
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
