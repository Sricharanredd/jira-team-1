import React, { useEffect, useState } from 'react';
import api from '../api/api';
import SprintGroupedIssueList from '../components/SprintGroupedIssueList';
import { useAuth } from '../context/AuthContext';
import { STATUS_OPTIONS } from '../constants'; // Ensure this is imported

const AssignedToMePage = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    // Filters State
    const [projectFilter, setProjectFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        const fetchMyTasks = async () => {
            if (!currentUser) return;
            
            try {
                // Fetch all issues (API respects visibility)
                const response = await api.get('/user-story');
                const allIssues = response.data;
                
                // Filter Frontend: Assigned to Me
                // Case-insensitive match just in case, though backend usually standardizes
                const myIssues = allIssues.filter(issue => 
                    issue.assignee && issue.assignee.toLowerCase() === currentUser.name.toLowerCase()
                );
                
                setTasks(myIssues);
            } catch (error) {
                console.error("Failed to fetch assigned tasks", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyTasks();
    }, [currentUser]);

    // Derived Filter Options
    const availableProjects = [...new Set(tasks.map(t => t.project_name).filter(Boolean))].sort();

    // Filtering Logic
    const filteredTasks = tasks.filter(task => {
        const matchesProject = projectFilter === 'ALL' || task.project_name === projectFilter;
        const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
        return matchesProject && matchesStatus;
    });

    if (loading) return <div className="p-8 text-gray-500">Loading assigned issues...</div>;

    return (
        <div className="h-full bg-white flex flex-col">
             <div className="px-8 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-6">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-600 p-1.5 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        </span>
                        Assigned to Me
                    </h1>
                    
                    {/* Filter Bar */}
                    <div className="flex items-center gap-3">
                         {/* Project Filter */}
                         <select
                            value={projectFilter}
                            onChange={(e) => setProjectFilter(e.target.value)}
                            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer hover:bg-gray-50"
                         >
                             <option value="ALL">All Projects</option>
                             {availableProjects.map(p => (
                                 <option key={p} value={p}>{p}</option>
                             ))}
                         </select>

                         {/* Status Filter */}
                         <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer hover:bg-gray-50"
                         >
                             <option value="ALL">All Statuses</option>

                             {STATUS_OPTIONS.map(status => (
                                 <option key={status.value} value={status.value}>{status.label}</option>
                             ))}
                         </select>
                    </div>
                </div>
                
                <div className="text-sm text-gray-500 font-medium">
                    {filteredTasks.length === tasks.length 
                        ? `${tasks.length} issues total`
                        : `Showing ${filteredTasks.length} of ${tasks.length} issues`
                    }
                </div>
             </div>
             
             <div className="flex-1 overflow-auto p-8">
                 {filteredTasks.length > 0 ? (
                     <SprintGroupedIssueList issues={filteredTasks} showProjectColumn={true} />
                 ) : (
                    // Empty State Handling
                    <div className="text-center py-20">
                        <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                        {tasks.length === 0 ? (
                            <>
                                <h3 className="text-lg font-medium text-gray-900">No issues assigned to you</h3>
                                <p className="text-gray-500 mt-1">Looks like you're all caught up!</p>
                            </>
                        ) : (
                            <>
                                <h3 className="text-lg font-medium text-gray-900">No issues match your filters</h3>
                                <p className="text-gray-500 mt-1">Try adjusting the project or status filter.</p>
                                <button 
                                    onClick={() => { setProjectFilter('ALL'); setStatusFilter('ALL'); }}
                                    className="mt-4 text-blue-600 hover:underline font-medium"
                                >
                                    Clear all filters
                                </button>
                            </>
                        )}
                    </div>
                 )}
             </div>
        </div>
    );
};

export default AssignedToMePage;
