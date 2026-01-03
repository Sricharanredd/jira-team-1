import React from 'react';
import { ISSUE_TYPE_OPTIONS } from '../constants';

const IssueFilters = ({
    assigneeFilter,
    setAssigneeFilter,
    typeFilter,
    setTypeFilter,
    sprintFilter,
    setSprintFilter,
    uniqueAssignees = [],
    uniqueSprints = []
}) => {
    return (
        <div className="flex gap-4">
            {setSprintFilter && (
                <select 
                    value={sprintFilter} 
                    onChange={(e) => setSprintFilter(e.target.value)}
                    className="bg-white border border-gray-300 text-gray-700 py-1.5 px-3 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value="">All Sprints</option>
                    {uniqueSprints.map(s => <option key={s} value={s}>Sprint {s}</option>)}
                </select>
            )}

            <select 
                value={assigneeFilter} 
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 py-1.5 px-3 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
                <option value="">All Assignees</option>
                {uniqueAssignees.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            <select 
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 py-1.5 px-3 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
                <option value="">All Types</option>
                {ISSUE_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
    );
};

export default IssueFilters;
