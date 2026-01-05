import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { toFormData } from '../api/api';

const CreateStoryPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignee: '',
        reviewer: '',
        status: 'todo',
        issue_type: 'story',
        priority: 'medium',
        sprint_number: '',
        release_number: '',
        support_doc: null,
        parent_issue: '',
        start_date: '',
        end_date: ''
    });

    const [project, setProject] = useState(null);
    const [assignees, setAssignees] = useState([]);
    const [parentIssues, setParentIssues] = useState([]);

    const STATUS_OPTIONS = [
        { value: 'todo', label: 'To Do' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'testing', label: 'Testing' },
        { value: 'done', label: 'Done' },
    ];

    const ISSUE_TYPES = [
        { value: 'epic', label: 'Epic', color: 'bg-[#6554c0]' },
        { value: 'story', label: 'Story', color: 'bg-[#36b37e]' },
        { value: 'task', label: 'Task', color: 'bg-[#4BADE8]' },
        { value: 'bug', label: 'Bug', color: 'bg-[#ff5630]' },
    ];

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const [projRes, assigneesRes, issuesRes] = await Promise.all([
                    api.get(`/project/${projectId}`),
                    api.get(`/projects/${projectId}/assignees`),
                    api.get('/user-story')
                ]);
                setProject(projRes.data);
                setAssignees(assigneesRes.data);
                // Filter issues for this project to be potential parents
                setParentIssues(issuesRes.data.filter(i => i.project_id === parseInt(projectId)));
            } catch (error) {
                console.error("Failed to load project metadata", error);
            }
        };
        if (projectId) fetchMeta();
    }, [projectId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'start_date' && value) {
            const startDate = new Date(value);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 14);
            const endDateStr = endDate.toISOString().split('T')[0];
            setFormData(prev => ({ ...prev, [name]: value, end_date: endDateStr }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, support_doc: e.target.files[0] }));
    };

    const getFilteredParents = () => {
        const type = formData.issue_type;
        if (type === 'story') return parentIssues.filter(i => i.issue_type === 'epic');
        if (type === 'task') return parentIssues.filter(i => i.issue_type === 'story');
        if (type === 'subtask') return parentIssues.filter(i => i.issue_type === 'task');
        return [];
    };

    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            alert("Summary is required");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                project_id: parseInt(projectId),
                parent_issue_id: formData.parent_issue ? parseInt(formData.parent_issue) : null,
                start_date: formData.start_date || null,
                end_date: formData.end_date || null,
            };
            const data = toFormData(payload);

            await api.post(`/projects/${projectId}/issues`, data);
            navigate(`/projects/${projectId}/issues`); // Go to issues list
        } catch (error) {
            console.error("Create failed", error);
            alert("Failed to create issue: " + (error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full bg-white flex flex-col overflow-auto font-sans text-[#172B4D]">
            {/* Header Area */}
            <div className="px-8 py-6 pb-0 bg-white">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-[#5E6C84] mb-4">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-blue-700">
                        <span className="bg-[#4BADE8] text-white rounded-[2px] w-4 h-4 flex items-center justify-center text-[10px] font-bold">P</span>
                        <span className="hover:underline" onClick={() => navigate(`/projects/${projectId}`)}>
                            {project?.project_name || 'Project'}
                        </span>
                    </div>
                    <span>/</span>
                    <span className="text-[#172B4D] font-medium">Create Issue</span>
                </div>

                {/* Title Input */}
                <div className="mb-6">
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Issue Summary"
                        className="w-full text-2xl font-medium text-[#172B4D] border-b border-transparent hover:border-[#DFE1E6] focus:border-[#4C9AFF] focus:outline-none placeholder-gray-300 py-1 transition-colors"
                        autoFocus
                    />
                </div>

                {/* Action Toolbar */}
                <div className="flex justify-between items-center mb-6 border-b border-[#DFE1E6] pb-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-[#0052CC] hover:bg-[#0065FF] text-white px-4 py-1.5 rounded-[3px] font-bold text-sm transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create'}
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="text-[#42526E] hover:bg-[#EBECF0] px-3 py-1.5 rounded-[3px] font-medium text-sm transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Form Content */}
            <div className="flex-1 overflow-auto bg-white px-8 py-2">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Details Section */}
                        <div>
                            <h3 className="text-xs font-semibold text-[#5E6C84] uppercase tracking-wide mb-3">Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 pl-4">
                                {/* Type */}
                                <div className="flex items-center">
                                    <span className="w-32 text-sm text-[#5E6C84] flex-shrink-0">Type:</span>
                                    <select
                                        name="issue_type"
                                        value={formData.issue_type}
                                        onChange={handleChange}
                                        className="text-sm text-[#172B4D] bg-[#F4F5F7] border border-transparent hover:border-[#DFE1E6] rounded-[3px] px-2 py-1 focus:bg-white focus:border-[#4C9AFF] focus:outline-none cursor-pointer"
                                    >
                                        {ISSUE_TYPES.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status */}
                                <div className="flex items-center">
                                    <span className="w-32 text-sm text-[#5E6C84] flex-shrink-0">Status:</span>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="text-sm text-[#172B4D] bg-[#F4F5F7] border border-transparent hover:border-[#DFE1E6] rounded-[3px] px-2 py-1 focus:bg-white focus:border-[#4C9AFF] focus:outline-none cursor-pointer uppercase font-bold"
                                    >
                                        {STATUS_OPTIONS.map(s => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Priority */}
                                <div className="flex items-center">
                                    <span className="w-32 text-sm text-[#5E6C84] flex-shrink-0">Priority:</span>
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        className="text-sm text-[#172B4D] bg-[#F4F5F7] border border-transparent hover:border-[#DFE1E6] rounded-[3px] px-2 py-1 focus:bg-white focus:border-[#4C9AFF] focus:outline-none cursor-pointer"
                                    >
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>

                                {/* Start Date */}
                                <div className="flex items-center">
                                    <span className="w-32 text-sm text-[#5E6C84] flex-shrink-0">Start Date:</span>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        className="text-sm text-[#172B4D] border border-[#DFE1E6] rounded px-1 py-0.5 focus:border-[#4C9AFF]"
                                    />
                                </div>
                                {/* End Date */}
                                <div className="flex items-center">
                                    <span className="w-32 text-sm text-[#5E6C84] flex-shrink-0">End Date:</span>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleChange}
                                        className="text-sm text-[#172B4D] border border-[#DFE1E6] rounded px-1 py-0.5 focus:border-[#4C9AFF]"
                                    />
                                </div>

                                {/* Parent Issue (if applicable) */}
                                {formData.issue_type !== 'epic' && (
                                    <div className="flex items-center">
                                        <span className="w-32 text-sm text-[#5E6C84] flex-shrink-0">Parent:</span>
                                        <select
                                            name="parent_issue"
                                            value={formData.parent_issue}
                                            onChange={handleChange}
                                            className="text-sm text-[#172B4D] bg-[#F4F5F7] border border-transparent hover:border-[#DFE1E6] rounded-[3px] px-2 py-1 focus:bg-white focus:border-[#4C9AFF] focus:outline-none cursor-pointer"
                                        >
                                            <option value="">None</option>
                                            {getFilteredParents().map(p => (
                                                <option key={p.id} value={p.id}>{p.story_code} - {p.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description Section */}
                        <div>
                            <h3 className="text-xs font-semibold text-[#5E6C84] uppercase tracking-wide mb-2">Description</h3>
                            <div className="pl-4">
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={8}
                                    placeholder="Add a description..."
                                    className="w-full border border-[#DFE1E6] hover:border-[#B3BAC5] rounded-[3px] px-3 py-2 text-sm text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#4C9AFF] transition-colors"
                                />
                            </div>
                        </div>

                        {/* Attachments Section */}
                        <div>
                            <h3 className="text-xs font-semibold text-[#5E6C84] uppercase tracking-wide mb-2">Attachments</h3>
                            <div className="pl-4">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-[#5E6C84]
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-[3px] file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-[#F4F5F7] file:text-[#42526E]
                                        hover:file:bg-[#EBECF0]
                                        cursor-pointer
                                    "
                                />
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-4 space-y-8 pl-4 lg:border-l border-gray-100">
                        {/* People Panel */}
                        <div>
                            <h4 className="text-xs font-semibold text-[#5E6C84] uppercase tracking-wide mb-3">People</h4>
                            <div className="space-y-4">
                                {/* Assignee */}
                                <div className="flex items-center">
                                    <span className="w-24 text-sm text-[#5E6C84]">Assignee:</span>
                                    <select
                                        name="assignee"
                                        value={formData.assignee}
                                        onChange={handleChange}
                                        className="text-sm text-[#0052CC] font-medium bg-transparent border-none focus:ring-0 cursor-pointer hover:underline"
                                    >
                                        <option value="">Unassigned</option>
                                        {assignees.map(u => (
                                            <option key={u.id} value={u.value}>{u.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Reviewer */}
                                <div className="flex items-center">
                                    <span className="w-24 text-sm text-[#5E6C84]">Reviewer:</span>
                                    <input
                                        type="text"
                                        name="reviewer"
                                        value={formData.reviewer}
                                        onChange={handleChange}
                                        placeholder="Add reviewer..."
                                        className="text-sm text-[#172B4D] bg-transparent border-none hover:bg-[#F4F5F7] px-1 rounded focus:outline-none focus:ring-1 focus:ring-[#4C9AFF]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dates & Planning Panel */}
                        <div>
                            <h4 className="text-xs font-semibold text-[#5E6C84] uppercase tracking-wide mb-3">Planning</h4>
                            <div className="space-y-4">
                                {/* Sprint */}
                                <div className="flex items-center">
                                    <span className="w-24 text-sm text-[#5E6C84]">Sprint:</span>
                                    <input
                                        type="text"
                                        name="sprint_number"
                                        value={formData.sprint_number}
                                        onChange={handleChange}
                                        placeholder="e.g. 1"
                                        className="w-20 text-sm text-[#172B4D] border border-[#DFE1E6] rounded px-1 py-0.5 focus:border-[#4C9AFF]"
                                    />
                                </div>

                                {/* Release */}
                                <div className="flex items-center">
                                    <span className="w-24 text-sm text-[#5E6C84]">Release:</span>
                                    <input
                                        type="text"
                                        name="release_number"
                                        value={formData.release_number}
                                        onChange={handleChange}
                                        placeholder="e.g. 1.0"
                                        className="w-20 text-sm text-[#172B4D] border border-[#DFE1E6] rounded px-1 py-0.5 focus:border-[#4C9AFF]"
                                    />
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default CreateStoryPage;
