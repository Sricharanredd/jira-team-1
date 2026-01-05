import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';

const TimelinePage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [groupedTasks, setGroupedTasks] = useState([]);
    const [expandedGroups, setExpandedGroups] = useState({});
    const [loading, setLoading] = useState(true);
    const [zoom, setZoom] = useState('weekly');

    // Helper to format dates
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/user-story?project_id=${projectId}`);
                setTasks(res.data);
                groupTasks(res.data);
            } catch (error) {
                console.error("Failed to fetch timeline tasks", error);
            } finally {
                setLoading(false);
            }
        };

        if (projectId) {
            fetchTasks();
        }
    }, [projectId]);

    const groupTasks = (allTasks) => {
        // Separating Epics and Child Issues
        const epics = allTasks.filter(t => t.issue_type === 'epic');
        const orphans = allTasks.filter(t => t.issue_type !== 'epic' && !t.parent_issue_id);

        let groups = [];

        // 1. Process Epics and find their children
        epics.forEach(epic => {
            const children = allTasks.filter(t => t.parent_issue_id === epic.id);
            groups.push({
                ...epic,
                isGroup: true,
                children: children
            });
        });

        // 2. Add Orphan stories as a generic group or loose items
        if (orphans.length > 0) {
            groups.push({
                id: 'orphans',
                title: 'Unassigned Stories', // Virtual Group
                story_code: '---',
                isGroup: true,
                isVirtual: true,
                children: orphans
            });
        }

        // Initially expand all
        const initialExpanded = {};
        groups.forEach(g => { initialExpanded[g.id] = true; });
        setExpandedGroups(initialExpanded);

        setGroupedTasks(groups);
    };

    const toggleGroup = (groupId) => {
        setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
    };

    // ------------------- GANTT CALCULATIONS -------------------

    const getRange = () => {
        let minDate = new Date();
        let maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30);

        // Use created_at as fallback for start_date
        const validTasks = tasks.filter(t => t.start_date || t.created_at || t.end_date);

        if (validTasks.length > 0) {
            const startDates = validTasks.map(t => t.start_date ? new Date(t.start_date) : (t.created_at ? new Date(t.created_at) : new Date()));
            const endDates = validTasks.map(t => t.end_date ? new Date(t.end_date) : new Date());

            minDate = new Date(Math.min(...startDates));
            maxDate = new Date(Math.max(...endDates));
        }

        // Normalize to midnight for accurate day grid alignment
        minDate.setHours(0, 0, 0, 0);
        maxDate.setHours(0, 0, 0, 0);

        minDate.setDate(minDate.getDate() - 7);
        maxDate.setDate(maxDate.getDate() + 14);

        return { minDate, maxDate };
    };

    const { minDate, maxDate } = getRange();

    const days = [];
    const currentDate = new Date(minDate);
    while (currentDate <= maxDate) {
        days.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    const DAY_WIDTH = zoom === 'weekly' ? 40 : 6; // Compressed for Monthly (6px * 30 = ~180px/month)
    const ROW_HEIGHT = 40; // Compact rows
    const SIDEBAR_WIDTH = 650; // Widened for Status and Date columns

    const getPosition = (date) => {
        if (!date) return 0;
        const diffTime = date - minDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays * DAY_WIDTH;
    };

    const getWidth = (start, end) => {
        // Ensure at least 1 day width
        if (!start) return DAY_WIDTH;

        const s = new Date(start);

        let e;
        if (end) {
            e = new Date(end);
        } else {
            // Fallback: Default to 14 days (Sprint duration) if no end date
            e = new Date(s);
            e.setDate(e.getDate() + 14);
        }

        // If end < start (e.g. created after due date?), clamp
        if (e < s) return DAY_WIDTH;

        const diffTime = e - s;
        const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
        return diffDays * DAY_WIDTH;
    };

    const getBarColor = (status) => {
        switch (status) {
            case 'done': return '#008000'; // Green
            case 'in_progress': return '#3333ff'; // Blue
            case 'testing': return '#FFD700'; // Yellow
            default: return '#ff8080'; // Todo/Backlog - Red
        }
    };

    const getBadgeStyle = (status) => {
        switch (status) {
            case 'done': return { backgroundColor: '#008000', color: 'white' };
            case 'in_progress': return { backgroundColor: '#3333ff', color: 'white' };
            case 'testing': return { backgroundColor: '#FFD700', color: 'black' };
            default: return { backgroundColor: '#ff8080', color: 'black' };
        }
    };

    // Time-based Progress Calculation
    const getProgress = (start, end, status) => {
        if (status === 'done') return '100%';
        if (!start) return '0%';

        const s = new Date(start);

        let e;
        if (end) {
            e = new Date(end);
        } else {
            // Fallback: Default to 14 days for progress calc too
            e = new Date(s);
            e.setDate(e.getDate() + 14);
        }

        const now = new Date();
        if (now < s) return '0%';
        if (now > e) return '100%';

        const total = e - s;
        const elapsed = now - s;

        if (total <= 0) return '100%';

        const pct = Math.round((elapsed / total) * 100);
        return `${Math.min(100, Math.max(0, pct))}%`;
    };

    // Flatten logic for rendering
    // We need a flat list of rows to render, respecting expansion state
    const getVisibleRows = () => {
        const rows = [];
        groupedTasks.forEach(group => {
            // Add Group Header
            rows.push({ type: 'group', data: group });

            // Add Children if expanded
            if (expandedGroups[group.id]) {
                group.children.forEach(child => {
                    rows.push({ type: 'task', data: child, parentId: group.id });
                });
            }
        });
        return rows;
    };

    const visibleRows = getVisibleRows();

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden">
            {/* Toolbar */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h1 className="text-xl font-bold text-[#172B4D]">Project Timeline</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setZoom('weekly')}
                        className={`px-3 py-1 rounded text-sm font-medium ${zoom === 'weekly' ? 'bg-gray-200 text-gray-900' : 'bg-transparent text-gray-500 hover:bg-gray-100'}`}
                    >
                        Weekly
                    </button>
                    <button
                        onClick={() => setZoom('monthly')}
                        className={`px-3 py-1 rounded text-sm font-medium ${zoom === 'monthly' ? 'bg-gray-200 text-gray-900' : 'bg-transparent text-gray-500 hover:bg-gray-100'}`}
                    >
                        Monthly
                    </button>

                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex justify-center items-center text-gray-500">Loading timeline...</div>
            ) : (
                <div className="flex-1 flex overflow-hidden">
                    {/* LEFT SIDEBAR */}
                    <div className="flex-shrink-0 border-r border-gray-200 flex flex-col bg-white z-10" style={{ width: SIDEBAR_WIDTH }}>
                        {/* Sidebar Header */}
                        <div className="h-[60px] border-b border-gray-200 flex items-center bg-white font-semibold text-gray-600 shadow-sm z-20">
                            <div className="flex-1 px-4 border-r border-gray-100 h-full flex items-center">
                                Issue
                            </div>
                            <div className="w-[120px] px-4 border-r border-gray-100 h-full flex items-center justify-center">
                                Status
                            </div>
                            <div className="w-[100px] px-4 border-r border-gray-100 h-full flex items-center justify-center">
                                Start
                            </div>
                            <div className="w-[100px] px-4 h-full flex items-center justify-center">
                                End
                            </div>
                        </div>
                        {/* Sidebar Content */}
                        <div className="overflow-hidden bg-white">
                            {visibleRows.map((row, i) => (
                                <div
                                    key={`${row.data.id}-${row.type}`}
                                    className={`border-b border-gray-100 flex items-center hover:bg-gray-50 ${row.type === 'group' ? 'bg-white font-bold' : ''}`}
                                    style={{ height: ROW_HEIGHT }}
                                >
                                    {/* Issue Title Column */}
                                    <div
                                        className="flex-1 flex items-center px-4 truncate border-r border-gray-100 h-full"
                                        style={{ paddingLeft: row.type === 'task' ? '30px' : '10px' }}
                                    >
                                        {row.type === 'group' && (
                                            <button onClick={() => toggleGroup(row.data.id)} className="mr-2 text-gray-500 hover:text-gray-700 focus:outline-none">
                                                {expandedGroups[row.data.id] ? '▼' : '▶'}
                                            </button>
                                        )}
                                        {row.type === 'group' && !row.data.isVirtual && (
                                            <span className="bg-purple-100 text-purple-800 text-[10px] px-1 rounded mr-2 uppercase">Epic</span>
                                        )}
                                        <span className={`text-sm text-[#172B4D] truncate ${row.type === 'group' ? 'font-semibold' : ''}`}>
                                            {row.data.title}
                                        </span>
                                    </div>

                                    {/* Status Column */}
                                    <div className="w-[120px] flex items-center justify-center px-2 h-full border-r border-gray-100">
                                        {row.type === 'task' && (
                                            <span
                                                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border border-black/5 shadow-sm"
                                                style={getBadgeStyle(row.data.status || 'todo')}
                                            >
                                                {row.data.status ? row.data.status.replace('_', ' ') : 'Todo'}
                                            </span>
                                        )}
                                    </div>

                                    {/* Start Date Column */}
                                    <div className="w-[100px] flex items-center justify-center px-2 h-full border-r border-gray-100 text-xs text-gray-600">
                                        {row.type === 'task' && formatDate(row.data.start_date || row.data.created_at)}
                                    </div>

                                    {/* End Date Column */}
                                    <div className="w-[100px] flex items-center justify-center px-2 h-full text-xs text-gray-600">
                                        {row.type === 'task' && formatDate(row.data.end_date)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT TIMELINE */}
                    <div className="flex-1 flex flex-col overflow-auto bg-white relative">
                        {/* Calendar Header */}
                        <div className="sticky top-0 z-10 bg-white" style={{ minWidth: days.length * DAY_WIDTH }}>
                            <div className="h-[40px] border-b border-gray-200 flex bg-[#F4F5F7]">
                                {days.map((day, i) => {
                                    const isFirstDayOfMonth = day.getDate() === 1;
                                    const showLabel = isFirstDayOfMonth || i === 0;

                                    // Styling for Monthly View
                                    if (zoom === 'monthly') {
                                        return (
                                            <div
                                                key={i}
                                                className={`flex-shrink-0 flex items-center h-full
                                                    ${isFirstDayOfMonth ? 'border-l border-gray-300' : ''} 
                                                `}
                                                style={{ width: DAY_WIDTH }}
                                            >
                                                {showLabel && (
                                                    <span className="absolute ml-2 text-xs font-bold text-[#5E6C84] uppercase whitespace-nowrap z-20">
                                                        {day.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}/{day.toLocaleDateString('en-US', { year: '2-digit' })}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    }

                                    // Styling for Weekly View
                                    return (
                                        <div
                                            key={i}
                                            className="flex-shrink-0 text-xs font-semibold text-[#5E6C84] flex flex-col justify-center items-center border-r border-gray-200"
                                            style={{ width: DAY_WIDTH }}
                                        >
                                            <span className="uppercase">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                            <span className="text-[10px]">{day.getDate()}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Rows */}
                        <div className="relative" style={{ minWidth: days.length * DAY_WIDTH, height: visibleRows.length * ROW_HEIGHT }}>
                            <div className="absolute inset-0 flex pointer-events-none z-0">
                                {days.map((day, i) => {
                                    // Logic for Grid Lines
                                    const isMonthStart = zoom === 'monthly' && day.getDate() === 1;
                                    const isWeekly = zoom === 'weekly';
                                    return (
                                        <div key={i} className={`flex-shrink-0 ${isWeekly ? 'border-r border-gray-200' : ''} ${isMonthStart ? 'border-l border-gray-300' : ''} h-full`} style={{ width: DAY_WIDTH }}></div>
                                    );
                                })}
                            </div>

                            {/* Today Marker */}
                            {(() => {
                                const today = new Date();
                                if (today >= minDate && today <= maxDate) {
                                    return (
                                        <div className="absolute top-0 bottom-0 border-l-2 border-red-500 z-20 pointer-events-none" style={{ left: getPosition(today) }}>
                                            <div className="bg-red-500 text-white text-[10px] px-1 rounded-b absolute top-0 -left-[18px] transform -translate-x-1/2">Today</div>
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            {visibleRows.map((row, i) => {
                                const task = row.data;

                                // Render Group Row Background
                                if (row.type === 'group') {
                                    return (
                                        <div key={`g-${task.id}`} className="absolute w-full bg-white border-b border-gray-200 z-10" style={{ top: i * ROW_HEIGHT, height: ROW_HEIGHT }}>
                                            {/* Bar for Epic itself if it has dates? Optional. Assuming Epics span children for now, not rendering bar. */}
                                        </div>
                                    );
                                }

                                // Render Task Bar
                                const start = task.start_date ? new Date(task.start_date) : (task.created_at ? new Date(task.created_at) : null);
                                const end = task.end_date ? new Date(task.end_date) : null;

                                const effectiveStart = start || new Date(); // Should not happen with created_at, but safe guard
                                const startPos = getPosition(effectiveStart);
                                const width = getWidth(effectiveStart, end);

                                return (
                                    <div key={`t-${task.id}`} className="absolute w-full border-b border-gray-200 hover:bg-blue-50/10 z-10" style={{ top: i * ROW_HEIGHT, height: ROW_HEIGHT }}>
                                        {start && (
                                            <div
                                                className="absolute h-5 rounded shadow-sm text-xs flex items-center px-2 cursor-pointer transition-all hover:brightness-110 overflow-hidden"
                                                style={{
                                                    left: startPos,
                                                    width: width,
                                                    top: (ROW_HEIGHT - 20) / 2,
                                                    backgroundColor: '#E2E8F0', // Neutral Gray Background for "Remaining"
                                                    color: '#172B4D'
                                                }}
                                                onClick={() => navigate(`/projects/${projectId}/issues/${task.id}`)}
                                                title={`${task.title} (Created: ${new Date(task.created_at).toLocaleDateString()})`}
                                            >
                                                {/* Progress Bar (Solid Color) */}
                                                <div
                                                    className="absolute left-0 top-0 bottom-0 h-full transition-all duration-500 z-0"
                                                    style={{
                                                        width: getProgress(effectiveStart, end, task.status),
                                                        backgroundColor: getBarColor(task.status) // Solid Color for "Completed"
                                                    }}
                                                ></div>

                                                <span className="relative z-10 truncate w-full mix-blend-darken">{task.title}</span>
                                                <span className="absolute right-2 text-[10px] z-10 font-bold opacity-75 drop-shadow-sm">
                                                    {getProgress(effectiveStart, end, task.status)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimelinePage;