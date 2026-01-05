import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import { ISSUE_TYPE_OPTIONS } from '../constants';
import SprintGroupedIssueList from '../components/SprintGroupedIssueList';
import IssueFilters from '../components/IssueFilters';

const ProjectIssuesPage = () => {
    const { projectId } = useParams();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [assigneeFilter, setAssigneeFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    useEffect(() => {
        const fetchProjectTasks = async () => {
            try {
                // Fetch issues strictly for this project using standardized API
                const response = await api.get('/user-story', {
                    params: { project_id: projectId }
                });
                setTasks(response.data);
            } catch (error) {
                console.error("Failed to fetch tasks", error);
            } finally {
                setLoading(false);
            }
        };

        if (projectId) {
            fetchProjectTasks();
        }
    }, [projectId]);

    // Derived filters
    const uniqueAssignees = [...new Set(tasks.map(t => t.assignee).filter(Boolean))];

    const filteredTasks = tasks.filter(task => {
        const matchesAssignee = assigneeFilter ? task.assignee === assigneeFilter : true;
        const matchesType = typeFilter ? task.issue_type === typeFilter : true;
        return matchesAssignee && matchesType;
    });

    if (loading) return <div className="p-8 text-gray-500">Loading project issues...</div>;

    return (
        <div className="h-full bg-white flex flex-col">

            {/* Sub-header for Page Title and Filters */}
            <div className="px-8 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-800">Issues</h2>

                <div className="flex-1 ml-4 overflow-x-auto no-scrollbar">
                    {/* Placeholder for future tabs or breadcrumbs if needed */}
                </div>

                <div className="flex gap-4">
                    <IssueFilters
                        assigneeFilter={assigneeFilter}
                        setAssigneeFilter={setAssigneeFilter}
                        typeFilter={typeFilter}
                        setTypeFilter={setTypeFilter}
                        uniqueAssignees={uniqueAssignees}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-auto p-8">
                <SprintGroupedIssueList issues={filteredTasks} showProjectColumn={false} />
            </div>
        </div>
    );
};

export default ProjectIssuesPage;
