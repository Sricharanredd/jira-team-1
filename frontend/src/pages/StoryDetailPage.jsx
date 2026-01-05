import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';

import { STATUS_OPTIONS } from '../constants';

const StoryDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [story, setStory] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);



    const [parentIssues, setParentIssues] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        assignee: '',
        reviewer: '',
        description: '',
        status: '',
        sprint_number: '',
        start_date: '',
        end_date: '',
        parent_issue_id: ''
    });

    const [userRole, setUserRole] = useState(null);

    const [collapsedSections, setCollapsedSections] = useState({
        details: false,
        description: false,
        attachments: false,
        activity: false,
        people: false,
        dates: false
    });

    const toggleSection = (section) => {
        setCollapsedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const fetchData = async () => {
        try {
            const [storyRes, historyRes, projectsRes, allStoriesRes] = await Promise.all([
                api.get(`/user-story/${id}`),
                api.get(`/user-story/${id}/history`),
                api.get('/auth/me/projects'),
                api.get('/user-story')
            ]);
            setStory(storyRes.data);
            setHistory(historyRes.data);

            // Filter Epics for the dropdown (exclude self and non-epics if current is story)
            // Assuming current can only be child if it's not an epic?
            // Simplified: Get all Epics in the same project
            const projectEpics = allStoriesRes.data.filter(i =>
                i.project_id === storyRes.data.project_id &&
                i.issue_type === 'epic' &&
                i.id !== storyRes.data.id
            );
            setParentIssues(projectEpics);

            // Find role
            const currentProject = projectsRes.data.find(p => p.id === storyRes.data.project_id);
            if (currentProject) {
                // Map API role to UI display (ADMIN -> Admin, MEMBER -> User)
                const roleMap = {
                    'ADMIN': 'Admin',
                    'MEMBER': 'User',
                    'VIEWER': 'Viewer'
                };
                setUserRole(roleMap[currentProject.role] || currentProject.role);
            }

            setFormData({
                title: storyRes.data.title,
                assignee: storyRes.data.assignee,
                reviewer: storyRes.data.reviewer,
                description: storyRes.data.description,
                status: storyRes.data.status,
                sprint_number: storyRes.data.sprint_number,
                start_date: storyRes.data.start_date ? storyRes.data.start_date.split('T')[0] : '',
                end_date: storyRes.data.end_date ? storyRes.data.end_date.split('T')[0] : '',
                parent_issue_id: storyRes.data.parent_issue_id || ''
            });
        } catch (error) {
            console.error("Failed to fetch story details", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleSave = async () => {
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('assignee', formData.assignee);
            data.append('reviewer', formData.reviewer);
            data.append('description', formData.description);
            data.append('status', formData.status);
            data.append('sprint_number', formData.sprint_number);
            data.append('start_date', formData.start_date || '');
            data.append('end_date', formData.end_date || '');

            // Handle Parent Issue
            // If empty string, send null or empty? API usually expects ID or null.
            // FormData sends strings. Logic in backend might need check. 
            // Usually safer to send it if it has value, or handle nullable in backend.
            if (formData.parent_issue_id) {
                data.append('parent_issue_id', formData.parent_issue_id);
            } else {
                // Explicitly clearing it might require specific backend support (e.g. sending 'null' string or separate field)
                // For now assuming backend handles empty or we append 'null' if compatible.
                // Let's try appending empty string, backend should handle.
                data.append('parent_issue_id', '');
            }

            await api.put(`/user-story/${id}`, data);
            await fetchData();
            setIsEditing(false);
            window.dispatchEvent(new Event('story-updated'));
            window.dispatchEvent(new Event('story-created')); // Trigger refresh in backlog/board as well
        } catch (error) {
            alert("Failed to save changes: " + (error.response?.data?.detail || error.message));
        }
    };

    if (loading) return <div className="p-8 text-gray-500">Loading story details...</div>;
    if (!story) return <div className="p-8 text-red-500">Story not found.</div>;

    return (
        <div className="h-full bg-white flex flex-col overflow-auto font-sans text-[#172B4D]">
            {/* Header Area */}
            <div className="px-8 py-6 pb-0 bg-white">
                {/* Breadcrumbs & Close Button */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-xs text-[#5E6C84]">
                        <div className="flex items-center gap-1 cursor-pointer hover:text-blue-700">
                            <span className="bg-[#4BADE8] text-white rounded-[2px] w-4 h-4 flex items-center justify-center text-[10px] font-bold">P</span>
                            <span className="hover:underline" onClick={() => navigate(`/projects/${story.project_id}`)}>
                                {story.project_name}
                            </span>
                        </div>
                        <span>/</span>
                        <span className="cursor-pointer hover:underline text-[#6B778C]">{story.story_code}</span>
                    </div>
                    <button
                        onClick={() => navigate(`/projects/${story.project_id}`)}
                        className="text-[#42526E] hover:bg-[#EBECF0] p-1.5 rounded-[3px] transition-colors"
                        title="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Title */}
                <div className="mb-6">
                    {isEditing ? (
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full text-2xl font-medium text-[#172B4D] border border-blue-500 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    ) : (
                        <h1 className="text-2xl font-medium text-[#172B4D] leading-tight">
                            {story.title}
                        </h1>
                    )}
                </div>

                {/* Action Toolbar */}
                <div className="flex justify-between items-center mb-6">
                    {/* Left: Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-1.5 bg-[#F4F5F7] hover:bg-[#EBECF0] text-[#42526E] px-3 py-1.5 rounded-[3px] font-medium text-sm transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Edit
                        </button>

                    </div>

                    {/* Right: Status Workflow Buttons */}
                    <div className="flex items-center gap-1">
                        {['todo', 'in_progress', 'done'].map((status) => (
                            <button
                                key={status}
                                className={`px-3 py-1.5 text-xs font-semibold uppercase border rounded-[3px] transition-colors ${story.status === status
                                    ? 'bg-[#0052CC] text-white border-[#0052CC] cursor-default'
                                    : 'bg-white text-[#42526E] border-[#DFE1E6] hover:bg-[#F4F5F7] hover:border-[#C1C7D0]'
                                    }`}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                        {userRole && (
                            <div className="px-3 py-1.5 text-xs font-semibold uppercase border border-[#DFE1E6] bg-[#F4F5F7] text-[#42526E] rounded-[3px]">
                                {userRole}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="flex-1 overflow-auto bg-white">
                <div className="px-8 py-2 grid grid-cols-1 lg:grid-cols-12 gap-16">

                    {/* LEFT COLUMN (Details + Description) */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Details Group */}
                        <div>
                            <div
                                className="flex items-center gap-1 mb-3 cursor-pointer group select-none"
                                onClick={() => toggleSection('details')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 text-[#5E6C84] group-hover:text-[#172B4D] transition-transform ${collapsedSections.details ? '-rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                <h3 className="text-xs font-semibold text-[#5E6C84] uppercase tracking-wide group-hover:text-[#172B4D]">Details</h3>
                            </div>

                            {!collapsedSections.details && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-12 pl-4">
                                    {/* Column 1 of Details */}
                                    <div className="space-y-3">
                                        <div className="flex">
                                            <span className="w-32 text-sm text-[#5E6C84] flex-shrink-0">Type:</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`w-3.5 h-3.5 rounded-[2px] flex items-center justify-center ${story.issue_type === 'bug' ? 'bg-[#ff5630]' :
                                                    story.issue_type === 'epic' ? 'bg-[#6554c0]' : 'bg-[#36b37e]'
                                                    }`}>
                                                </span>
                                                <span className="text-sm text-[#172B4D] capitalize">{story.issue_type || 'Story'}</span>
                                            </div>
                                        </div>
                                        <div className="flex">
                                            <span className="w-32 text-sm text-[#5E6C84] flex-shrink-0">Priority:</span>
                                            <span className="text-sm text-[#172B4D] flex items-center gap-1">
                                                <svg className="w-3 h-3 text-[#FFAB00]" fill="currentColor" viewBox="0 0 20 20"><path d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" /></svg>
                                                Medium
                                            </span>
                                        </div>
                                        <div className="flex">
                                            <span className="w-32 text-sm text-[#5E6C84] flex-shrink-0">Affects Version/s:</span>
                                            <span className="text-sm text-[#172B4D]">None</span>
                                        </div>
                                        <div className="flex">
                                            <span className="w-32 text-sm text-[#5E6C84] flex-shrink-0">Component/s:</span>
                                            <span className="text-sm text-[#172B4D]">None</span>
                                        </div>
                                        <div className="flex">
                                            <span className="w-32 text-sm text-[#5E6C84] flex-shrink-0">Labels:</span>
                                            <span className="text-sm text-[#172B4D]">
                                                <span className="bg-[#EBECF0] text-[#42526E] px-1.5 py-0.5 rounded-[3px] text-xs font-semibold">automation</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Column 2 of Details */}
                                    <div className="space-y-3">
                                        <div className="flex">
                                            <span className="w-32 text-sm text-[#5E6C84] flex-shrink-0">Status:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="px-1.5 py-0.5 bg-[#42526E] text-white text-[11px] font-bold uppercase rounded-[3px]">
                                                    {story.status === 'in_progress' ? 'IN PROG' : story.status.replace('_', ' ')}
                                                </span>
                                                <span className="text-xs text-[#0052CC] hover:underline cursor-pointer">(View Workflow)</span>
                                            </div>
                                        </div>
                                        <div className="flex">
                                            <span className="w-32 text-sm text-[#5E6C84] flex-shrink-0">Resolution:</span>
                                            <span className="text-sm text-[#172B4D]">Unresolved</span>
                                        </div>
                                        <div className="flex">
                                            <span className="w-32 text-sm text-[#5E6C84] flex-shrink-0">Fix Version/s:</span>
                                            <span className="text-sm text-[#0052CC] hover:underline cursor-pointer">{story.release_number || 'None'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <div
                                className="flex items-center gap-1 mb-2 cursor-pointer select-none"
                                onClick={() => toggleSection('description')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 text-[#5E6C84] transition-transform ${collapsedSections.description ? '-rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                <h3 className="text-xs font-semibold text-[#5E6C84] uppercase tracking-wide">Description</h3>
                            </div>
                            {!collapsedSections.description && (
                                <div className="pl-4">
                                    {isEditing ? (
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={6}
                                            className="w-full border border-[#DFE1E6] hover:border-[#B3BAC5] rounded px-3 py-2 text-sm text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#4C9AFF]"
                                        />
                                    ) : (
                                        <div className={`text-sm text-[#172B4D] whitespace-pre-wrap leading-relaxed`}>
                                            {story.description || 'Click to add description...'}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Attachments */}
                        <div>
                            <div
                                className="flex items-center gap-1 mb-2 pl-4 cursor-pointer select-none"
                                onClick={() => toggleSection('attachments')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 text-[#5E6C84] transition-transform ${collapsedSections.attachments ? '-rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                <h3 className="text-xs font-semibold text-[#5E6C84] uppercase tracking-wide">Attachments</h3>
                            </div>
                            {!collapsedSections.attachments && (
                                <div className="pl-4">
                                    {story.support_doc ? (
                                        <div className="border border-[#DFE1E6] rounded-[3px] p-2 flex items-center gap-3 w-max bg-white hover:bg-[#F4F5F7] transition-colors cursor-pointer group">
                                            <span className="text-xl">📄</span>
                                            <div>
                                                <p className="text-sm font-medium text-[#172B4D] group-hover:text-[#0052CC]">{story.support_doc}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-[#5E6C84] italic pl-4">No attachments</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Activity */}
                        <div>
                            <div
                                className="flex items-center justify-between mb-4 pl-4 cursor-pointer select-none"
                                onClick={() => toggleSection('activity')}
                            >
                                <div className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 text-[#5E6C84] transition-transform ${collapsedSections.activity ? '-rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    <h3 className="text-xs font-semibold text-[#5E6C84] uppercase tracking-wide">Activity</h3>
                                </div>
                            </div>
                            {!collapsedSections.activity && (
                                <div className="space-y-4 pl-4">
                                    {history.map((log) => (
                                        <div key={log.id} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#DFE1E6] flex-shrink-0 flex items-center justify-center text-xs font-bold text-[#42526E]">
                                                {log.user_id ? 'U' : 'S'}
                                            </div>
                                            <div className="text-sm">
                                                <p className="text-[#172B4D]">
                                                    <span className="font-semibold text-[#0052CC] cursor-pointer">User</span> updated the
                                                    <span className="font-semibold mx-1">{log.field_name.replace('_', ' ')}</span>
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[#5E6C84] text-xs bg-[#F4F5F7] px-1 py-0.5 rounded">{log.old_value || 'None'}</span>
                                                    <span className="text-[#5E6C84]">→</span>
                                                    <span className="text-[#172B4D] text-xs font-medium bg-[#E3FCEF] px-1 py-0.5 rounded">{log.new_value || 'None'}</span>
                                                </div>
                                                <p className="text-xs text-[#5E6C84] mt-0.5">{new Date(log.changed_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {history.length === 0 && <p className="text-sm text-[#5E6C84] italic">No activity yet.</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN (People & Dates) */}
                    <div className="lg:col-span-4 space-y-8 pl-4 lg:border-l border-gray-100">
                        {/* People Panel */}
                        <div>
                            <div
                                className="flex items-center justify-between mb-3 cursor-pointer select-none"
                                onClick={() => toggleSection('people')}
                            >
                                <h4 className="text-xs font-semibold text-[#5E6C84] uppercase tracking-wide">People</h4>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-[#5E6C84] transition-transform ${collapsedSections.people ? '-rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>

                            {!collapsedSections.people && (
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <span className="w-24 text-sm text-[#5E6C84]">Assignee:</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-[#DFE1E6] flex items-center justify-center text-xs font-bold text-[#42526E]">
                                                {story.assignee ? story.assignee.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <span className="text-sm text-[#0052CC] hover:underline cursor-pointer">{story.assignee || 'Unassigned'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <span className="w-24 text-sm text-[#5E6C84]">Reporter:</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-[#DFE1E6] flex items-center justify-center text-xs font-bold text-[#42526E]">
                                                {story.reviewer ? story.reviewer.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <span className="text-sm text-[#0052CC] hover:underline cursor-pointer">{story.reviewer || 'Reporter'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Dates Panel */}
                        <div>
                            <div
                                className="flex items-center justify-between mb-3 cursor-pointer select-none"
                                onClick={() => toggleSection('dates')}
                            >
                                <h4 className="text-xs font-semibold text-[#5E6C84] uppercase tracking-wide">Dates</h4>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-[#5E6C84] transition-transform ${collapsedSections.dates ? '-rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>

                            {!collapsedSections.dates && (
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <span className="w-24 text-sm text-[#5E6C84]">Created:</span>
                                        <span className="text-sm text-[#172B4D]">{new Date(story.created_at || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-24 text-sm text-[#5E6C84]">Updated:</span>
                                        <span className="text-sm text-[#172B4D]">{new Date(story.updated_at || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal (Preserved for full editing if needed) */}
            {isEditing && (
                <div className="fixed inset-0 bg-[#091E42]/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-[#DFE1E6] flex justify-between items-center bg-[#F4F5F7]">
                            <h2 className="text-lg font-medium text-[#172B4D]">Edit Issue {story.story_code}</h2>
                            <button onClick={() => setIsEditing(false)} className="text-[#6B778C] hover:text-[#172B4D] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-[#5E6C84] uppercase mb-1.5">Summary</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full border border-[#DFE1E6] hover:border-[#B3BAC5] rounded-[3px] px-2 py-1.5 text-sm text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#4C9AFF]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#5E6C84] uppercase mb-1.5">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={8}
                                    className="w-full border border-[#DFE1E6] hover:border-[#B3BAC5] rounded-[3px] px-2 py-1.5 text-sm text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#4C9AFF]"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-[#5E6C84] uppercase mb-1.5">Assignee</label>
                                    <input
                                        type="text"
                                        value={formData.assignee}
                                        onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                                        className="w-full border border-[#DFE1E6] hover:border-[#B3BAC5] rounded-[3px] px-2 py-1.5 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#5E6C84] uppercase mb-1.5">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => {
                                            const newStatus = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                status: newStatus,
                                                sprint_number: newStatus === 'backlog' ? '' : prev.sprint_number
                                            }));
                                        }}
                                        className="w-full border border-[#DFE1E6] hover:border-[#B3BAC5] rounded-[3px] px-2 py-1.5 text-sm"
                                    >
                                        {STATUS_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#5E6C84] uppercase mb-1.5">Sprint</label>
                                    <input
                                        type="text"
                                        value={formData.sprint_number}
                                        onChange={(e) => setFormData({ ...formData, sprint_number: e.target.value })}
                                        disabled={formData.status === 'backlog'}
                                        className={`w-full border border-[#DFE1E6] hover:border-[#B3BAC5] rounded-[3px] px-2 py-1.5 text-sm ${formData.status === 'backlog' ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'text-[#172B4D]'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#5E6C84] uppercase mb-1.5">Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full border border-[#DFE1E6] hover:border-[#B3BAC5] rounded-[3px] px-2 py-1.5 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#5E6C84] uppercase mb-1.5">End Date</label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        className="w-full border border-[#DFE1E6] hover:border-[#B3BAC5] rounded-[3px] px-2 py-1.5 text-sm"
                                    />
                                </div>
                                {story.issue_type === 'story' && (
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-[#5E6C84] uppercase mb-1.5">Parent Epic</label>
                                        <select
                                            value={formData.parent_issue_id}
                                            onChange={(e) => setFormData({ ...formData, parent_issue_id: e.target.value })}
                                            className="w-full border border-[#DFE1E6] hover:border-[#B3BAC5] rounded-[3px] px-2 py-1.5 text-sm"
                                        >
                                            <option value="">Select an Epic</option>
                                            {parentIssues.map(issue => (
                                                <option key={issue.id} value={issue.id}>
                                                    {issue.story_code} - {issue.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-[#DFE1E6] flex justify-end gap-2 bg-[#F4F5F7]">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-3 py-1.5 text-[#42526E] font-medium hover:bg-[#EBECF0] rounded-[3px] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-3 py-1.5 bg-[#0052CC] text-white font-bold hover:bg-[#0065FF] rounded-[3px] transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoryDetailPage;
