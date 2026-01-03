import React, { useState } from 'react';
import api, { toFormData } from '../../api/api';

import { STATUS_OPTIONS, ISSUE_TYPE_OPTIONS } from '../../constants';

const CreateStoryModal = ({ isOpen, onClose, projectId, onStoryCreated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    release_number: '',
    sprint_number: '',
    assignee: '',
    reviewer: '',

    status: 'backlog', // Default to backlog per Scrum
    issue_type: 'story',
    support_doc: null
  });


  // Restore Missing State
  const [parentIssues, setParentIssues] = useState([]);
  const [parentError, setParentError] = useState('');

  // State for project selection if not provided
  const [availableProjects, setAvailableProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || '');

  // Update selectedProjectId if prop changes
  React.useEffect(() => {
    if (projectId) setSelectedProjectId(projectId);
  }, [projectId]);

  // Fetch projects if no projectId is provided
  React.useEffect(() => {
    if (isOpen && !projectId) {
      const fetchProjects = async () => {
        try {
          const res = await api.get('/project');
          setAvailableProjects(res.data);
          if (res.data.length > 0) {
            // Optionally default to first project
            // setSelectedProjectId(res.data[0].id);
          }
        } catch (e) {
          console.error("Failed to fetch projects", e);
        }
      };
      fetchProjects();
    }
  }, [isOpen, projectId]);

  // Fetch assignees
  const [assignees, setAssignees] = useState([]);

  React.useEffect(() => {
    if (isOpen && selectedProjectId) {
      const fetchAssignees = async () => {
        try {
          const res = await api.get(`/projects/${selectedProjectId}/assignees`);
          setAssignees(res.data);
        } catch (e) {
          console.error("Failed to fetch assignees", e);
        }
      };
      fetchAssignees();
    }
  }, [isOpen, selectedProjectId]);

  // Fetch potential parent issues when modal opens or projectId changes
  React.useEffect(() => {
    // Only fetch parents if we have a selected project
    if (isOpen && selectedProjectId) {
      const fetchParents = async () => {
        try {
          const response = await api.get('/user-story');
          // Filter for current project
          const issues = response.data.filter(i => i.project_id === parseInt(selectedProjectId));
          setParentIssues(issues);
        } catch (e) {
          console.error("Failed to fetch parent issues", e);
        }
      };
      fetchParents();
    } else {
      setParentIssues([]);
      setAssignees([]);
    }
  }, [isOpen, selectedProjectId]);

  const getFilteredParents = () => {
    const type = formData.issue_type;
    if (type === 'story') {
      return parentIssues.filter(i => i.issue_type === 'epic');
    } else if (type === 'task') {
      return parentIssues.filter(i => i.issue_type === 'story');
    } else if (type === 'subtask') {
      return parentIssues.filter(i => i.issue_type === 'task');
    } else if (type === 'bug') {
      return parentIssues.filter(i => ['story', 'task'].includes(i.issue_type));
    }
    return [];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Epic Rule: Default to Backlog (but user can change?)
    if (name === 'issue_type') {
      // Reset parent when type changes
      setFormData(prev => ({
        ...prev,
        [name]: value,
        parent_issue: '',
        status: value === 'epic' ? 'backlog' : prev.status
      }));
      setParentError('');
    } else {
      // Special Rule: If Status is set to 'backlog', clear Sprint
      if (name === 'status' && value === 'backlog') {
        setFormData(prev => ({ ...prev, [name]: value, sprint_number: '' }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    }

    // Clear subtask/parent error if fixed
    if (name === 'parent_issue' && value) {
      setParentError('');
    }
  };

  const handleProjectChange = (e) => {
    setSelectedProjectId(e.target.value);
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, support_doc: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setParentError('');

    // Project Validation
    if (!selectedProjectId) {
      setError('Please select a project.');
      setLoading(false);
      return;
    }

    // Hierarchy Validation Rules Front-end
    const type = formData.issue_type;
    if (['story', 'task', 'subtask'].includes(type) && !formData.parent_issue) {
      setParentError(`Parent issue is required for ${type}s.`);
      setLoading(false);
      return;
    }


    let isSuccess = false;

    try {
      const payload = {
        ...formData,
        project_id: parseInt(selectedProjectId), // REQUIRED by backend schema
        parent_issue_id: formData.parent_issue ? parseInt(formData.parent_issue) : null
      };

      const dataToSend = toFormData(payload);

      const response = await api.post(`/projects/${selectedProjectId}/issues`, dataToSend);

      // Standard Success Check
      if (response && response.status >= 200 && response.status < 300) {
        isSuccess = true;
      }
    } catch (err) {
      console.error("Create story error:", err);
      if (err.response && err.response.status === 409) {
        setError(`Error: ${err.response.data.detail}`);
      } else if (err.response && err.response.status >= 200 && err.response.status < 300) {
        isSuccess = true;
      } else {
        setError(err.response?.data?.detail || 'Failed to create story');
      }
    } finally {
      if (isSuccess) {
        try {
          if (onStoryCreated) {
            onStoryCreated();
          }
          onClose();
          setFormData({
            title: '',
            description: '',
            release_number: '',
            sprint_number: '',
            assignee: '',
            reviewer: '',
            status: 'todo',
            issue_type: 'story',
            support_doc: null,
            parent_issue: ''
          });
          setParentError('');
          setError(null);
        } catch (postError) {
          console.error("Error after creating story:", postError);
        }
      }
      setLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-10">
      <div className="bg-white p-6 rounded-lg w-[600px] shadow-xl max-h-full overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Create User Story</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm whitespace-pre-wrap">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Project Selector (Only if regular Create Mode) */}
          {!projectId && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1">Project</label>
              <select
                value={selectedProjectId}
                onChange={handleProjectChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Select a Project</option>
                {availableProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.project_name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Title</label>
            <input
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1">Release Number</label>
              <input
                name="release_number"
                type="text"
                value={formData.release_number}
                onChange={handleChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1">Sprint Number</label>
              <input
                name="sprint_number"
                type="text"
                value={formData.sprint_number}
                onChange={handleChange}
                className={`shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${formData.status === 'backlog' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                disabled={formData.status === 'backlog'}
                placeholder={formData.status === 'backlog' ? 'No Sprint (Backlog)' : ''}
                required={formData.status !== 'backlog'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1">Assignee</label>
              <select
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Select Assignee</option>
                {assignees.map(user => (
                  <option key={user.id} value={user.value}>{user.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1">Reviewer</label>
              <input
                name="reviewer"
                type="text"
                value={formData.reviewer}
                onChange={handleChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >

              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Issue Type</label>
            <select
              name="issue_type"
              value={formData.issue_type}
              onChange={handleChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              {ISSUE_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {formData.issue_type !== 'epic' && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1">
                {formData.issue_type === 'story' ? 'Parent Epic' :
                  formData.issue_type === 'task' ? 'Parent Story' :
                    formData.issue_type === 'subtask' ? 'Parent Task' :
                      'Parent Issue'} <span className={formData.issue_type === 'bug' ? "text-gray-400 font-normal" : "text-red-500"}>
                  {formData.issue_type === 'bug' ? '(Optional)' : '*'}
                </span>
              </label>
              <select
                name="parent_issue"
                value={formData.parent_issue || ''}
                onChange={handleChange}
                className={`shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${parentError ? 'border-red-500' : ''}`}
              >
                <option value="">
                  {formData.issue_type === 'story' ? 'Select an Epic' :
                    formData.issue_type === 'task' ? 'Select a Story' :
                      'Select Parent Issue'}
                </option>
                {getFilteredParents().map(issue => (
                  <option key={issue.id} value={issue.id}>
                    {issue.story_code} - {issue.title}
                  </option>
                ))}
              </select>
              {parentError && <p className="text-red-500 text-xs italic mt-1">{parentError}</p>}
              {getFilteredParents().length === 0 && (
                <p className="text-orange-500 text-xs mt-1">
                  No eligible parent issues found. Create a {
                    formData.issue_type === 'story' ? 'Epic' :
                      formData.issue_type === 'task' ? 'Story' : 'Parent'} first.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1">Support Document (Optional)</label>
            <input type="file" onChange={handleFileChange} className="text-sm text-gray-500" />
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStoryModal;
