import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
    const { currentUser } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await api.get('/auth/me/projects');
                setProjects(res.data);
            } catch (err) {
                console.error("Failed to load projects", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Account Settings</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="md:col-span-1">
                    <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                    <p className="mt-1 text-sm text-gray-500">Your basic account details.</p>
                </div>
                <div className="md:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide mb-1">Full Name</label>
                            <div className="text-gray-900 font-medium text-lg border-b border-gray-100 pb-2">{currentUser?.name}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide mb-1">Email Address</label>
                            <div className="text-gray-900 text-lg border-b border-gray-100 pb-2 flex items-center gap-2">
                                {currentUser?.email}
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-bold">Verified</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 border-t border-gray-200 pt-8">
                <div className="md:col-span-1">
                     <h3 className="text-lg font-medium text-gray-900">Security</h3>
                     <p className="mt-1 text-sm text-gray-500">Manage your password and security questions.</p>
                </div>
                <div className="md:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden p-6">
                    <div className="flex items-center justify-between">
                         <div>
                             <h4 className="text-sm font-bold text-gray-900">Password</h4>
                             <p className="text-sm text-gray-500">Last changed just now</p>
                         </div>
                         <button 
                            disabled 
                            className="bg-gray-50 text-gray-400 border border-gray-200 px-4 py-2 rounded text-sm font-medium cursor-not-allowed"
                            title="Password change coming soon"
                        >
                             Change Password
                         </button>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 pt-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Worked On</h2>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {projects.map((p) => (
                            <tr key={p.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{p.project_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{p.project_prefix}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${p.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 
                                          p.role === 'MEMBER' ? 'bg-green-100 text-green-800' : 
                                          'bg-gray-100 text-gray-800'}`}>
                                        {p.role}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {projects.length === 0 && (
                            <tr>
                                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                                    No projects found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            </div>
        </div>
    );
};

export default ProfilePage;
