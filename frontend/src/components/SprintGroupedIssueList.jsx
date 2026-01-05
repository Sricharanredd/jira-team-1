import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const SprintAccordion = ({ title, count, issues, isOpen, onToggle, showProjectColumn = true, context }) => {
    return (
        <div className="border border-gray-200 rounded-lg mb-4 bg-white shadow-sm overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
                <div className="flex items-center gap-2">
                    <svg
                        className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="font-semibold text-gray-700 text-sm">{title}</span>
                    <span className="text-gray-400 text-xs font-normal">({count} issues)</span>
                </div>
            </button>

            {isOpen && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase w-1/3">Title</th>
                                {showProjectColumn && <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Project</th>}
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">End</th>
                                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assignee</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {issues.map(task => (
                                <IssueRow key={task.id} task={task} showProject={showProjectColumn} context={context} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const IssueRow = ({ task, showProject, context }) => {
    const navigate = useNavigate();

    // Status color helper
    const getStatusColor = (status) => {
        switch (status) {
            case 'backlog': return 'bg-gray-100 text-gray-800';
            case 'todo': return 'bg-gray-200 text-gray-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'testing': return 'bg-orange-100 text-orange-800';
            case 'done': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    // Date formatter
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <tr
            onClick={() => navigate(`/projects/${task.project_id}/issues/${task.id}?context=${context}`)}
            className="hover:bg-gray-50 transition-colors cursor-pointer group"
        >
            <td className="px-6 py-3 whitespace-nowrap">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border ${task.issue_type === 'bug' ? 'bg-red-50 text-red-600 border-red-200' :
                    task.issue_type === 'task' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-green-50 text-green-600 border-green-200'
                    }`}>
                    {task.issue_type || 'story'}
                </span>
            </td>
            <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-500 group-hover:text-blue-600">
                {task.story_code || `ID-${task.id}`}
            </td>
            <td className="px-6 py-3 text-sm text-gray-900 font-medium">
                {task.title}
            </td>
            {showProject && (
                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                    {task.project_name}
                </td>
            )}
            <td className="px-6 py-3 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColor(task.status)}`}>
                    {task.status ? task.status.replace('_', ' ') : 'Unknown'}
                </span>
            </td>
            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                {formatDate(task.start_date)}
            </td>
            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                {formatDate(task.end_date)}
            </td>
            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                {task.assignee || 'Unassigned'}
            </td>
        </tr>
    );
};

const SprintGroupedIssueList = ({ issues, showProjectColumn = true, context = 'assigned_to_me' }) => {
    // Group by Sprint
    // Logic: 
    // 1. Identify all unique sprints.
    // 2. Separate "Backlog" (no sprint).
    // 3. Sort Sprints (numerically).

    // State to track expanded sections (default all expanded)
    // We'll use a specific key format: "sprint_{number}" or "backlog"
    const [expandedSections, setExpandedSections] = useState({});

    // Initialize expanded state on first render or issues change is tricky if issues change dynamically.
    // Instead, we treat "undefined" as expanded by default in the render logic?
    // User Requirement: "By default: ALL sprints should be expanded"
    // So we can check if key is in expandedSections (if we treat it as a "collapsed" set) OR
    // initialize strictly. Let's use a "collapsed" set instead, easier for "default expanded".
    const [collapsedSections, setCollapsedSections] = useState(new Set());

    const toggleSection = (key) => {
        const newCollapsed = new Set(collapsedSections);
        if (newCollapsed.has(key)) {
            newCollapsed.delete(key);
        } else {
            newCollapsed.add(key);
        }
        setCollapsedSections(newCollapsed);
    };

    const groupedData = useMemo(() => {
        const groups = {};
        const backlog = [];

        issues.forEach(issue => {
            if (issue.sprint_number) {
                const sKey = issue.sprint_number;
                if (!groups[sKey]) groups[sKey] = [];
                groups[sKey].push(issue);
            } else {
                backlog.push(issue);
            }
        });

        // Sort keys (sprints)
        // Assuming sprint_number is numeric or string formatted number
        const sortedKeys = Object.keys(groups).sort((a, b) => {
            // Try to parse numbers
            const numA = parseInt(a);
            const numB = parseInt(b);
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
            return a.localeCompare(b);
        });

        return { groups, sortedKeys, backlog };
    }, [issues]);

    if (issues.length === 0) {
        return <div className="text-center py-12 text-gray-500 italic">No issues found.</div>;
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Sprints */}
            {groupedData.sortedKeys.map(sprintNum => (
                <SprintAccordion
                    key={`sprint_${sprintNum}`}
                    title={`Sprint ${sprintNum}`}
                    count={groupedData.groups[sprintNum].length}
                    issues={groupedData.groups[sprintNum]}
                    isOpen={!collapsedSections.has(`sprint_${sprintNum}`)}
                    onToggle={() => toggleSection(`sprint_${sprintNum}`)}
                    showProjectColumn={showProjectColumn}
                    context={context}
                />
            ))}

            {/* Backlog Section */}
            {groupedData.backlog.length > 0 && (
                <SprintAccordion
                    key="backlog"
                    title="Backlog"
                    count={groupedData.backlog.length}
                    issues={groupedData.backlog}
                    isOpen={!collapsedSections.has('backlog')}
                    onToggle={() => toggleSection('backlog')}
                    showProjectColumn={showProjectColumn}
                    context={context}
                />
            )}
        </div>
    );
};

export default SprintGroupedIssueList;
