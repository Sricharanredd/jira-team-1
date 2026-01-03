import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import ProjectHeader from '../components/ProjectHeader';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ProjectReports = () => {
    const { projectId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState(null);
    const [statusData, setStatusData] = useState([]);
    const [typeData, setTypeData] = useState([]);
    const [projectName, setProjectName] = useState('');

    useEffect(() => {
        const fetchReportData = async () => {
             setLoading(true);
             setError(null);
             try {
                // Fetch basic project info for name
                const projectRes = await api.get(`/projects/${projectId}`);
                setProjectName(projectRes.data.project_name);

                // Fetch Reports
                const [summaryRes, statusRes, typeRes] = await Promise.all([
                    api.get(`/projects/${projectId}/reports/summary`),
                    api.get(`/projects/${projectId}/reports/issues-by-status`),
                    api.get(`/projects/${projectId}/reports/issues-by-type`)
                ]);

                setSummary(summaryRes.data);
                setStatusData(statusRes.data);
                setTypeData(typeRes.data);

             } catch (err) {
                 console.error("Failed to fetch reports", err);
                 setError(err.response?.data?.detail || "Failed to load report data");
             } finally {
                 setLoading(false);
             }
        };

        if (projectId) {
            fetchReportData();
        }
    }, [projectId]);


    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-gray-500 animate-pulse">Loading reports...</div>
            </div>
        );
    }

    if (error) {
         return (
             <div className="p-8 text-center text-red-500">
                 Error: {error}
             </div>
         );
    }

    const { total_issues, done, in_progress, backlog } = summary || {};

    if (total_issues === 0) {
        return (
             <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                 <div className="bg-gray-100 p-6 rounded-full mb-4">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                 </div>
                 <h2 className="text-xl font-bold text-gray-800 mb-2">No data available</h2>
                 <p className="text-gray-500 max-w-md">
                     This project has no issues yet. Create issues in the Board or Backlog to see analytics here.
                 </p>
             </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gray-50 overflow-y-auto">
            {/* Header Removed (Handled by Layout) */}

            <div className="p-8 space-y-8">
                 {/* Summary Cards */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <SummaryCard title="Total Issues" value={total_issues} color="bg-blue-600" />
                      <SummaryCard title="Done" value={done} color="bg-green-500" />
                      <SummaryCard title="In Progress" value={in_progress} color="bg-indigo-500" />
                      <SummaryCard title="Backlog" value={backlog} color="bg-gray-500" />
                 </div>

                 {/* Charts */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Status Chart */}
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                          <h3 className="font-bold text-gray-800 mb-6">Issues by Status</h3>
                          <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                      <Pie
                                          data={statusData}
                                          cx="50%"
                                          cy="50%"
                                          outerRadius={80}
                                          fill="#8884d8"
                                          dataKey="count"
                                          nameKey="status"
                                          label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                      >
                                          {statusData.map((entry, index) => (
                                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                          ))}
                                      </Pie>
                                      <Tooltip />
                                      <Legend />
                                  </PieChart>
                              </ResponsiveContainer>
                          </div>
                      </div>

                      {/* Type Chart */}
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                          <h3 className="font-bold text-gray-800 mb-6">Issues by Type</h3>
                          <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={typeData}>
                                      <XAxis dataKey="type" />
                                      <YAxis allowDecimals={false} />
                                      <Tooltip />
                                      <Bar dataKey="count" fill="#82ca9d">
                                          {typeData.map((entry, index) => (
                                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                          ))}
                                      </Bar>
                                  </BarChart>
                              </ResponsiveContainer>
                          </div>
                      </div>
                 </div>
            </div>
        </div>
    );
};

const SummaryCard = ({ title, value, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`h-2 w-2 rounded-full ${color}`}></div>
    </div>
);

export default ProjectReports;
