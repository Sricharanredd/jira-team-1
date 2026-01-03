import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import CreateProjectModal from '../components/modals/CreateProjectModal';

const Workspace = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await api.get('/project');
            setProjects(response.data);
        } catch (error) {
            console.error("Failed to fetch projects", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const isGlobalAdmin = currentUser?.global_role === 'ADMIN';

    if (loading) return <div className="p-8">Loading workspace...</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Your Work</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Create Project Card (Admin Only) */}
                {isGlobalAdmin && (
                    <div 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-blue-500 transition-colors h-48 group"
                    >
                         <div className="bg-blue-100 text-blue-600 rounded-full p-3 mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                         </div>
                         <span className="font-semibold text-gray-700">Create New Project</span>
                    </div>
                )}

                {/* Project Cards */}
                {projects.map((project) => (
                    <div 
                        key={project.id}
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-48 flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-bold text-gray-900 truncate" title={project.project_name}>
                                    {project.project_name}
                                </h3>
                            </div>
                            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                {project.project_prefix}
                            </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 mt-4">
                            <span>Manage Project &rarr;</span>
                        </div>
                    </div>
                ))}
            </div>

            <CreateProjectModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onProjectCreated={fetchProjects}
            />
        </div>
    );
};

export default Workspace;
