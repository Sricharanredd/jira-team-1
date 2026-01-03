import React, { useState, useEffect } from 'react';
import api, { toFormData } from '../../api/api';

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'testing', label: 'Testing' },
  { value: 'done', label: 'Done' },
];

const TaskDetailsModal = ({ isOpen, onClose, task, onUpdate, isReadOnly }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Editable fields only
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sprint_number: '',
    status: '',
    assignee: '',
    reviewer: ''
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        sprint_number: task.sprint_number,
        status: task.status,
        assignee: task.assignee,
        reviewer: task.reviewer
      });
      setIsEditing(false); // Reset to view mode on open
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dataToSend = toFormData(formData);
      // Note: Backend might not support updating all fields, but UI allows editing per req.
      await api.put(`/user-story/${task.id}`, dataToSend);
      onUpdate();
      setIsEditing(false); // Exit edit mode
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
           <div>
              <div className="flex items-center gap-2 mb-1">
                 <span className="text-gray-500 font-bold text-xs uppercase tracking-wide bg-gray-200 px-2 py-0.5 rounded">
                    {task.story_code}
                 </span>
                 <span className="text-gray-400 text-xs">/</span>
                 <span className="text-gray-500 font-medium text-xs uppercase tracking-wide">
                    {task.project_name}
                 </span>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              {/* Edit Toggle */}
              {/* Edit Toggle */}
              {!isEditing && !isReadOnly && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                  </button>
              )}

              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
           </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm flex items-center gap-2">
             {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
             {/* Title */}
             <div>
               <h2 className="text-2xl font-semibold text-gray-900 leading-tight">
                  {task.title}
               </h2>
             </div>

             {/* Status / Sprint / Issue Type Badges */}
             <div className="flex gap-4">
                 {isEditing ? (
                    <>
                       <div className="relative">
                          <select
                              name="status"
                              value={formData.status}
                              onChange={handleChange}
                              className="appearance-none bg-blue-50 border border-blue-200 text-blue-700 py-1 px-3 pr-8 rounded text-xs font-bold uppercase tracking-wide focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                          >
                              {STATUS_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-700">
                             <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                          </div>
                       </div>
                       
                       <div className="flex items-center">
                          <span className="text-gray-500 text-xs font-bold mr-1">Sprint</span>
                          <input
                              name="sprint_number"
                              type="text"
                              value={formData.sprint_number}
                              onChange={handleChange}
                              className="w-16 bg-gray-50 border border-gray-200 text-gray-700 py-1 px-2 rounded text-xs font-medium focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
                          />
                       </div>
                    </>
                 ) : (
                    <>
                       <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${
                          task.status === 'done' ? 'bg-green-100 text-green-700' : 
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                       }`}>
                          {task.status.replace('_', ' ')}
                       </span>
                       <span className="px-2 py-1 rounded text-xs font-bold uppercase tracking-wide bg-gray-100 text-gray-600">
                          Sprint {task.sprint_number}
                       </span>
                    </>
                 )}
             </div>

             {/* Description */}
             <div>
               <label className="block text-gray-500 text-xs font-bold uppercase mb-1.5">Description</label>
               {isEditing ? (
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    className="w-full bg-white border border-blue-200 rounded-lg p-3 text-gray-700 text-sm focus:border-blue-500 focus:outline-none resize-y transition-colors leading-relaxed shadow-sm"
                    placeholder="Add a description..."
                  />
               ) : (
                  <div className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg border border-transparent">
                     {task.description}
                  </div>
               )}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6 pt-6 border-t border-gray-100">
             {/* Read-Only Meta */}
             <div>
                <span className="block text-gray-400 text-xs font-medium mb-1">Release</span>
                <span className="text-sm font-medium text-gray-700">{task.release_number}</span>
             </div>
             <div>
                <span className="block text-gray-400 text-xs font-medium mb-1">Created At</span>
                <span className="text-sm font-medium text-gray-700">{new Date(task.created_at || Date.now()).toLocaleDateString()}</span>
             </div>

             {/* Editable Assignee/Reviewer */}
             <div className={isEditing ? 'bg-blue-50 p-2 rounded -m-2' : ''}>
                <span className={`block text-xs font-medium mb-1 ${isEditing ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>Assignee</span>
                {isEditing ? (
                   <input
                      name="assignee"
                      value={formData.assignee}
                      onChange={handleChange}
                      className="w-full bg-white border border-blue-200 text-gray-700 py-1 px-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                   />
                ) : (
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold ring-2 ring-white">
                          {task.assignee ? task.assignee[0].toUpperCase() : 'U'}
                       </div>
                       <span className="text-sm font-medium text-gray-700">{task.assignee}</span>
                    </div>
                )}
             </div>

             <div className={isEditing ? 'bg-blue-50 p-2 rounded -m-2' : ''}>
                <span className={`block text-xs font-medium mb-1 ${isEditing ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>Reviewer</span>
                 {isEditing ? (
                   <input
                      name="reviewer"
                      value={formData.reviewer}
                      onChange={handleChange}
                      className="w-full bg-white border border-blue-200 text-gray-700 py-1 px-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                   />
                ) : (
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold ring-2 ring-white">
                          {task.reviewer ? task.reviewer[0].toUpperCase() : 'R'}
                       </div>
                       <span className="text-sm font-medium text-gray-700">{task.reviewer}</span>
                    </div>
                )}
             </div>
          </div>
        
          {task.support_doc && (
             <div className="pt-4 border-t border-gray-100">
                <span className="block text-gray-400 text-xs font-medium mb-2">Attachment</span>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-100">
                   <span className="text-blue-500">📄</span>
                   <span className="text-sm text-gray-600 font-medium truncate flex-1">{task.support_doc}</span>
                </div>
             </div>
           )}

        </div>

        {/* Footer (Actions) - Only show in Edit Mode */}
        {isEditing && (
            <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex justify-end gap-3 backdrop-blur-sm animate-fade-in">
               <button
                 type="button"
                 onClick={() => setIsEditing(false)}
                 className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
               >
                 Cancel
               </button>
               <button
                 onClick={handleSubmit}
                 disabled={loading}
                 className="px-6 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm"
               >
                 {loading ? 'Saving...' : 'Save Changes'}
               </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailsModal;
