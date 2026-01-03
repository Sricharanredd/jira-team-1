import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { 
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';

const ReportsPage = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProjects: 0,
        totalIssues: 0,
        stories: []
    });

    useEffect(() => {
        const fetchStats = async () => {
             try {
                 // Call all three report endpoints (plus user-story for extra charts)
                 const [summaryRes, statusRes, typeRes, storiesRes] = await Promise.all([
                     api.get('/reports/summary'),
                     api.get('/reports/issues-by-status'),
                     api.get('/reports/issues-by-type'),
                     api.get('/user-story')
                 ]);

                 setStats({
                     totalProjects: summaryRes.data.total_projects,
                     totalIssues: summaryRes.data.total_issues,
                     statusCounts: statusRes.data, // [{status: 'todo', count: 1}]
                     typeCounts: typeRes.data,     // [{type: 'story', count: 1}]
                     stories: storiesRes.data      // For Assignee/Sprint fallback
                 });

             } catch (error) {
                 console.error("Failed to fetch reports data", error);
             } finally {
                 setLoading(false);
             }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-gray-500">Loading reports...</div>;

    // --- Data Aggregation ---

    // 1. Issues by Status (From API)
    // Map API status to Display Name & Color
    const STATUS_MAP = {
        'backlog': { name: 'Backlog', color: '#9CA3AF' },
        'todo': { name: 'To Do', color: '#64748B' },
        'in_progress': { name: 'In Progress', color: '#3B82F6' },
        'testing': { name: 'Testing', color: '#F97316' },
        'done': { name: 'Done', color: '#22C55E' }
    };

    const statusData = (stats.statusCounts || []).map(item => {
        const config = STATUS_MAP[item.status] || { name: item.status, color: '#000000' };
        return {
            name: config.name,
            value: item.count,
            color: config.color
        };
    }).filter(item => item.value > 0);


    // 2. Issues by Issue Type (From API)
    // Colors for types
    const COLORS_TYPE = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'];
    const typeData = (stats.typeCounts || []).map((item, index) => {
        // Capitalize
        const label = item.type.charAt(0).toUpperCase() + item.type.slice(1);
        return {
            name: label,
            value: item.count,
            color: COLORS_TYPE[index % COLORS_TYPE.length]
        };
    }).filter(item => item.value > 0);


    // 3. Issues by Assignee (From Stories Local)
    const assigneeCounts = (stats.stories || []).reduce((acc, story) => {
        const assignee = story.assignee || 'Unassigned';
        acc[assignee] = (acc[assignee] || 0) + 1;
        return acc;
    }, {});

    const assigneeData = Object.keys(assigneeCounts)
        .map(key => ({ name: key, count: assigneeCounts[key] }))
        .sort((a, b) => b.count - a.count);

    // 4. Issues by Sprint (From Stories Local)
    const sprintCounts = (stats.stories || []).reduce((acc, story) => {
        const sprint = story.sprint_number || 'No Sprint';
        acc[sprint] = (acc[sprint] || 0) + 1;
        return acc;
    }, {});

    const sprintData = Object.keys(sprintCounts)
        .map(key => ({ name: key, count: sprintCounts[key] }))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));


    return (
        <div className="h-full bg-white flex flex-col p-8 overflow-auto">
             <h1 className="text-2xl font-bold text-gray-900 mb-8">System Reports</h1>

             {/* 1. Summary Cards */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                 <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl flex justify-between items-center">
                     <div>
                        <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Total Projects</h3>
                        <p className="text-4xl font-bold text-blue-600">{stats.totalProjects}</p>
                     </div>
                 </div>
                 <div className="bg-purple-50 border border-purple-100 p-6 rounded-xl flex justify-between items-center">
                     <div>
                        <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Total Issues</h3>
                        <p className="text-4xl font-bold text-purple-600">{stats.totalIssues}</p>
                     </div>
                 </div>
             </div>

             {/* Charts Grid */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 
                 {/* 2. Issues by Status (Pie) */}
                 <div className="bg-white border rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Issues by Status</h3>
                    <div className="h-[300px] w-full">
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState />
                        )}
                    </div>
                 </div>

                 {/* 3. Issues by Type (Pie) */}
                 <div className="bg-white border rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Issues by Type</h3>
                    <div className="h-[300px] w-full">
                         {typeData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={typeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {typeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                         ) : (
                             <EmptyState />
                         )}
                    </div>
                 </div>

                 {/* 4. Issues by Assignee (Bar) */}
                 <div className="bg-white border rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Issues by Assignee</h3>
                    <div className="h-[300px] w-full">
                         {assigneeData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={assigneeData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#60A5FA" name="Issues" />
                                </BarChart>
                            </ResponsiveContainer>
                         ) : (
                             <EmptyState />
                         )}
                    </div>
                 </div>

                 {/* 5. Issues by Sprint (Bar) */}
                 <div className="bg-white border rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Issues by Sprint</h3>
                    <div className="h-[300px] w-full">
                         {sprintData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sprintData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#818CF8" name="Issues" />
                                </BarChart>
                            </ResponsiveContainer>
                         ) : (
                             <EmptyState />
                         )}
                    </div>
                 </div>

             </div>
        </div>
    );
};

const EmptyState = () => (
    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
        No data available
    </div>
);

export default ReportsPage;
