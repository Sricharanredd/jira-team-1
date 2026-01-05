import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const EpicDetailsModal = ({ isOpen, onClose, epic, issues }) => {
    const navigate = useNavigate();

    // Filter child stories for this Epic
    const childStories = useMemo(() => {
        if (!epic || !issues) return [];
        return issues.filter(issue => issue.parent_issue_id === epic.id);
    }, [epic, issues]);

    if (!isOpen || !epic) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            {/* Modal Content */}
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-white bg-purple-600 px-2 py-0.5 rounded uppercase tracking-wider">Epic</span>
                            <span className="text-xs font-medium text-gray-500">{epic.story_code}</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{epic.title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* Description (Optional) */}
                    {epic.description && (
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                            <p className="text-gray-700 text-sm whitespace-pre-wrap">{epic.description}</p>
                        </div>
                    )}

                    {/* Child Stories List */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                            <span>Child Issues</span>
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px]">{childStories.length}</span>
                        </h3>

                        {childStories.length > 0 ? (
                            <div className="space-y-2">
                                {childStories.map(story => (
                                    <div
                                        key={story.id}
                                        className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-gray-200 transition-all cursor-pointer flex items-center justify-between group"
                                        onClick={() => {
                                            onClose(); // Close modal first
                                            navigate(`/projects/${story.project_id}/issues/${story.id}`);
                                        }}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            {/* Status Indicator */}
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${story.status === 'done' ? 'bg-green-500' :
                                                story.status === 'in_progress' ? 'bg-blue-500' :
                                                    story.status === 'testing' ? 'bg-orange-500' :
                                                        'bg-gray-400'
                                                }`} title={story.status.replace('_', ' ')}></div>

                                            <div className="flex flex-col min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1 rounded">{story.story_code}</span>
                                                    <span className="text-sm font-medium text-gray-700 truncate group-hover:text-blue-600 transition-colors">{story.title}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-gray-400 opacity-60 group-hover:opacity-100 transition-opacity">
                                            {story.assignee && (
                                                <div className="flex items-center gap-1" title={`Assignee: ${story.assignee}`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>{story.assignee}</span>
                                                </div>
                                            )}
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <p className="text-gray-400 text-sm">No stories linked to this Epic yet.</p>
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
};

export default EpicDetailsModal;
