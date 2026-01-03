import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const GlobalSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [allData, setAllData] = useState({ projects: [], stories: [] });
    const wrapperRef = useRef(null);
    const navigate = useNavigate();

    // Fetch data for search (Simulated global index)
    // In a real app, this would be a backend search endpoint.
    // For now, we fetch all and filter client side as requested "Partial match...".
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectsRes, storiesRes] = await Promise.all([
                    api.get('/project'),
                    api.get('/user-story')
                ]);
                setAllData({
                    projects: projectsRes.data,
                    stories: storiesRes.data
                });
            } catch (error) {
                console.error("Search index build failed", error);
            }
        };
        fetchData(); // Simplification: fetching on mount. Ideally debounce or fetch on focus.
    }, []);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        
        const matchedProjects = allData.projects.filter(p => 
            p.project_name.toLowerCase().includes(lowerQuery)
        ).map(p => ({ ...p, type: 'project' }));

        const matchedStories = allData.stories.filter(s => 
            s.title.toLowerCase().includes(lowerQuery) || 
            s.story_code.toLowerCase().includes(lowerQuery)
        ).map(s => ({ ...s, type: 'story' }));

        setResults([...matchedProjects, ...matchedStories]);
        setIsOpen(true);
    }, [query, allData]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (item) => {
        setQuery('');
        setIsOpen(false);
        if (item.type === 'project') {
            navigate(`/projects/${item.id}`);
        } else {
            navigate(`/issues/${item.id}`);
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-64 md:w-96">
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </span>
                <input
                    type="text"
                    className="w-full bg-gray-100 border-none rounded-md py-2 pl-10 pr-4 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 transition-shadow placeholder-gray-500"
                    placeholder="Search projects or issues..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(results.length > 0)}
                />
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-md shadow-lg border border-gray-100 overflow-hidden z-50 max-h-96 overflow-y-auto">
                    {results.map((item, index) => (
                        <div 
                            key={`${item.type}-${item.id}`}
                            onClick={() => handleSelect(item)}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                        >
                            <div className="flex items-center justify-between mb-0.5">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                    item.type === 'project' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                    {item.type}
                                </span>
                                {item.type === 'story' && (
                                    <span className="text-xs text-gray-400 font-mono">{item.story_code}</span>
                                )}
                            </div>
                            <div className="text-sm font-medium text-gray-800 truncate">
                                {item.type === 'project' ? item.project_name : item.title}
                            </div>
                            {item.type === 'story' && (
                                <div className="text-xs text-gray-500 mt-0.5 truncate">
                                    in {item.project_name}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
             {isOpen && query && results.length === 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-md shadow-lg border border-gray-100 p-4 text-center text-sm text-gray-500 z-50">
                    No results found.
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;
