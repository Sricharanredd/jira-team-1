import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import { useProject } from '../context/ProjectContext';
import ProjectHeader from '../components/ProjectHeader';

const ProjectSettings = () => {
    const { projectId } = useParams();
    const [members, setMembers] = useState([]);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberRole, setNewMemberRole] = useState('DEVELOPER'); // Default to DEVELOPER
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    const { userRole } = useProject();

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await api.get(`/projects/${projectId}/members`);
                setMembers(res.data);
            } catch (err) {
                console.error("Failed to fetch members", err);
                setError("Failed to load members or Access Denied");
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, [projectId]);

    const handleAddMember = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg('');
        
        try {
            const formData = new FormData();
            formData.append('email', newMemberEmail);
            formData.append('role', newMemberRole);
            
            await api.post(`/projects/${projectId}/members`, formData);
            
            setSuccessMsg('Member added successfully!');
            setNewMemberEmail('');
            // Refresh list
            const res = await api.get(`/projects/${projectId}/members`);
            setMembers(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to add member");
        }
    };

    if (loading) return <div className="p-8">Loading settings...</div>;

    if (userRole !== 'ADMIN' && userRole !== 'SCRUM_MASTER') {
        return <div className="p-8 text-red-600">Access Denied. Only Project Admins or Scrum Masters can view settings.</div>;
    }

    return (
        <div className="p-0 max-w-none mx-auto bg-gray-50 min-h-full flex flex-col">
            {/* Header Removed (Handled by Layout) */}
            
            <div className="p-8 max-w-4xl mx-auto w-full flex-1">
            
                {/* Project Members Section */}
                <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Team Members</h2>
                    </div>
                    
                    {/* Add Member Form */}
                    <div className="p-6 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Add New Member</h3>
                        <form onSubmit={handleAddMember} className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Email Address</label>
                                <input 
                                    type="email" 
                                    value={newMemberEmail}
                                    onChange={(e) => setNewMemberEmail(e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    placeholder="colleague@example.com"
                                    required
                                />
                            </div>
                            <div className="w-40">
                                <label className="block text-xs text-gray-500 mb-1">Role</label>
                                <select
                                    value={newMemberRole}
                                    onChange={(e) => setNewMemberRole(e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                >
                                    <option value="ADMIN">Admin</option>
                                    <option value="SCRUM_MASTER">Scrum Master</option>
                                    <option value="DEVELOPER">Developer</option>
                                    <option value="TESTER">Tester</option>
                                    <option value="VIEWER">Viewer</option>
                                </select>
                            </div>
                            <button 
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium text-sm shadow-sm"
                            >
                                Add
                            </button>
                        </form>
                        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                        {successMsg && <p className="mt-2 text-sm text-green-600">{successMsg}</p>}
                    </div>

                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {members.map((m) => (
                                <tr key={m.user_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{m.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {userRole === 'ADMIN' ? (
                                            <select
                                                value={m.role}
                                                onChange={async (e) => {
                                                    const newRole = e.target.value;
                                                    try {
                                                        const formData = new FormData();
                                                        formData.append('email', m.email);
                                                        formData.append('role', newRole);
                                                        await api.post(`/projects/${projectId}/members`, formData);
                                                        // Optimistic update or refresh
                                                        setMembers(prev => prev.map(mem => mem.user_id === m.user_id ? { ...mem, role: newRole } : mem));
                                                        setSuccessMsg(`Updated ${m.name}'s role to ${newRole}`);
                                                        setTimeout(() => setSuccessMsg(''), 3000);
                                                    } catch (err) {
                                                        setError(err.response?.data?.detail || "Failed to update role");
                                                    }
                                                }}
                                                className="text-xs border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            >
                                                <option value="ADMIN">ADMIN</option>
                                                <option value="SCRUM_MASTER">SCRUM_MASTER</option>
                                                <option value="DEVELOPER">DEVELOPER</option>
                                                <option value="TESTER">TESTER</option>
                                                <option value="VIEWER">VIEWER</option>
                                            </select>
                                        ) : (
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${m.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 
                                                  m.role === 'SCRUM_MASTER' ? 'bg-blue-100 text-blue-800' :
                                                  m.role === 'DEVELOPER' ? 'bg-green-100 text-green-800' :
                                                  'bg-gray-100 text-gray-800'}`}>
                                                {m.role}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProjectSettings;
