import React, { useState, useEffect } from 'react';
import api from '../api/api';

const GlobalSettingsPage = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const tabs = [
        { id: 'general', label: 'General' },
        { id: 'users', label: 'Users & Roles' },
        { id: 'security', label: 'Security' },
        { id: 'issues', label: 'Issue Configuration' },
        { id: 'system', label: 'System' }
    ];

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-[#172B4D]">Global Settings</h1>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar / Tabs */}
                <div className="w-64 bg-gray-50 border-r border-gray-200 py-6 overflow-y-auto">
                    <nav className="space-y-1 px-3">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setMessage(null); }}
                                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    activeTab === tab.id 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    {message && (
                        <div className={`mb-4 px-4 py-3 rounded ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                            {message.text}
                        </div>
                    )}
                    
                    {activeTab === 'general' && <GeneralSettingsTab setMessage={setMessage} />}
                    {activeTab === 'users' && <UsersTab />}
                    {activeTab === 'security' && <SecurityTab setMessage={setMessage} />}
                    {activeTab === 'issues' && <IssueConfigTab />}
                    {activeTab === 'system' && <SystemTab />}
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const GeneralSettingsTab = ({ setMessage }) => {
    const [formData, setFormData] = useState({
        workspace_name: '',
        default_timezone: 'UTC',
        date_format: 'YYYY-MM-DD',
        time_format: '24h'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/settings/general')
            .then(res => setFormData(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put('/settings/general', formData);
            setMessage({ type: 'success', text: 'General settings updated successfully.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update settings.' });
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Workspace Name</label>
                <input 
                    type="text" 
                    value={formData.workspace_name} 
                    onChange={e => setFormData({...formData, workspace_name: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700">Date Format</label>
                   <select 
                       value={formData.date_format}
                       onChange={e => setFormData({...formData, date_format: e.target.value})}
                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                   >
                       <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                       <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                       <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700">Time Format</label>
                   <select 
                       value={formData.time_format}
                       onChange={e => setFormData({...formData, time_format: e.target.value})}
                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                   >
                       <option value="24h">24h (14:00)</option>
                       <option value="12h">12h (2:00 PM)</option>
                   </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Default Timezone</label>
                <input 
                    type="text" 
                    value={formData.default_timezone}
                    onChange={e => setFormData({...formData, default_timezone: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                />
            </div>

            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
                Save Changes
            </button>
        </form>
    );
};

const UsersTab = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/settings/users')
            .then(res => setUsers(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading users...</div>;

    return (
        <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(user => (
                        <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {user.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const SecurityTab = ({ setMessage }) => {
    const [formData, setFormData] = useState({
        password_min_length: 8,
        password_require_uppercase: true,
        password_require_number: true,
        password_require_symbol: true
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/settings/security')
            .then(res => setFormData(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put('/settings/security', formData);
            setMessage({ type: 'success', text: 'Security settings updated.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update security settings.' });
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Minimum Password Length</label>
                <input 
                    type="number" 
                    value={formData.password_min_length} 
                    onChange={e => setFormData({...formData, password_min_length: parseInt(e.target.value)})}
                    className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                />
            </div>
            
            <div className="space-y-4">
                <div className="flex items-center">
                    <input 
                        id="req_upper"
                        type="checkbox"
                        checked={formData.password_require_uppercase}
                        onChange={e => setFormData({...formData, password_require_uppercase: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="req_upper" className="ml-2 block text-sm text-gray-900">Require Uppercase Letter</label>
                </div>
                <div className="flex items-center">
                    <input 
                        id="req_num"
                        type="checkbox"
                        checked={formData.password_require_number}
                        onChange={e => setFormData({...formData, password_require_number: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="req_num" className="ml-2 block text-sm text-gray-900">Require Number</label>
                </div>
                <div className="flex items-center">
                    <input 
                        id="req_sym"
                        type="checkbox"
                        checked={formData.password_require_symbol}
                        onChange={e => setFormData({...formData, password_require_symbol: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="req_sym" className="ml-2 block text-sm text-gray-900">Require Symbol</label>
                </div>
            </div>

            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
                Save Security Rules
            </button>
        </form>
    );
};

const IssueConfigTab = () => {
    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Issue Types</h3>
                <div className="grid grid-cols-4 gap-4">
                    {['Epic', 'Story', 'Task', 'Bug'].map(type => (
                        <div key={type} className="border rounded p-4 text-center bg-gray-50">
                            <span className="font-semibold">{type}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Statuses</h3>
                <div className="grid grid-cols-4 gap-4">
                    {['To Do', 'In Progress', 'Testing', 'Done'].map(status => (
                        <div key={status} className="border rounded p-4 text-center bg-gray-50">
                            <span className="font-semibold">{status}</span>
                        </div>
                    ))}
                </div>
            </div>

             <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                <h4 className="text-sm font-bold text-blue-800">Story ID Format</h4>
                <p className="text-sm text-blue-700 mt-1">
                    Issues are identified by a Project Prefix followed by a sequential number (e.g., <span className="font-mono">PROJ-101</span>).
                </p>
            </div>
        </div>
    );
};

const SystemTab = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.get('/settings/system')
            .then(res => setStats(res.data))
            .catch(err => console.error(err));
    }, []);

    if (!stats) return <div>Loading stats...</div>;

    return (
        <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                 <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                 <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.total_users}</dd>
            </div>
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                 <dt className="text-sm font-medium text-gray-500 truncate">Total Projects</dt>
                 <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.total_projects}</dd>
            </div>
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                 <dt className="text-sm font-medium text-gray-500 truncate">Total Issues</dt>
                 <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.total_issues}</dd>
            </div>
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                 <dt className="text-sm font-medium text-gray-500 truncate">System Version</dt>
                 <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.version}</dd>
            </div>
        </div>
    );
};

export default GlobalSettingsPage;
