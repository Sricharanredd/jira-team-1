import React, { useEffect, useState } from 'react';
import api from '../api/api';
import SprintGroupedIssueList from '../components/SprintGroupedIssueList';
import IssueFilters from '../components/IssueFilters';

const GlobalIssuesPage = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [assigneeFilter, setAssigneeFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    useEffect(() => {
        const fetchAllTasks = async () => {
            try {
                const response = await api.get('/user-story');
                setTasks(response.data);
            } catch (error) {
                console.error("Failed to fetch tasks", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllTasks();
    }, []);

    // Derived filters
    const uniqueAssignees = [...new Set(tasks.map(t => t.assignee).filter(Boolean))];

    const filteredTasks = tasks.filter(task => {
        const matchesAssignee = assigneeFilter ? task.assignee === assigneeFilter : true;
        const matchesType = typeFilter ? task.issue_type === typeFilter : true;
        return matchesAssignee && matchesType;
    });

    if (loading) return <div className="p-8 text-gray-500">Loading issues...</div>;

    return (
        <div className="h-full bg-white flex flex-col">
             <div className="px-8 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                <h1 className="text-2xl font-bold text-gray-900">All Issues</h1>
                
                <IssueFilters 
                    assigneeFilter={assigneeFilter}
                    setAssigneeFilter={setAssigneeFilter}
                    typeFilter={typeFilter}
                    setTypeFilter={setTypeFilter}
                    uniqueAssignees={uniqueAssignees}
                />
             </div>
             
             <div className="flex-1 overflow-auto p-8">
                 <SprintGroupedIssueList issues={filteredTasks} showProjectColumn={true} />
             </div>
        </div>
    );
};

export default GlobalIssuesPage;
