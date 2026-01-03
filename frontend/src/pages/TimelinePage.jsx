import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';

const TimelinePage = () => {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(14);

    const fetchTimeline = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/reports/timeline?days=${days}&project_id=${projectId}`);
            setEvents(res.data);
        } catch (error) {
            console.error("Failed to fetch timeline", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTimeline();
    }, [days]);

    // Group events by date
    const groupedEvents = events.reduce((acc, event) => {
        const date = event.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(event);
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedEvents).sort((a, b) => new Date(b) - new Date(a));

    return (
        <div className="h-full flex flex-col bg-white p-8 overflow-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-[#172B4D]">Timeline</h1>
                <select 
                    value={days} 
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-[#172B4D]"
                >
                    <option value={7}>Last 7 Days</option>
                    <option value={14}>Last 14 Days</option>
                    <option value={30}>Last 30 Days</option>
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center p-8 text-gray-500">Loading activity...</div>
            ) : (
                <div className="relative border-l-2 border-[#EBECF0] ml-3 space-y-8">
                    {sortedDates.map(date => (
                        <div key={date} className="relative">
                            <div className="absolute -left-[21px] top-0 bg-[#F4F5F7] border border-[#DFE1E6] rounded-full px-3 py-1 text-xs font-bold text-[#5E6C84] uppercase tracking-wide">
                                {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </div>
                            
                            <div className="mt-8 space-y-4 pl-8">
                                {groupedEvents[date].map((event, idx) => (
                                    <div key={`${event.issue_id}-${idx}`} className="flex gap-4 group">
                                         <div className="w-[60px] text-xs text-gray-400 pt-1 text-right flex-shrink-0">
                                            {event.time}
                                         </div>
                                         <div className="flex-1 bg-white hover:bg-[#FAFBFC] border border-transparent hover:border-[#DFE1E6] rounded p-2 transition-all cursor-pointer"
                                              onClick={() => navigate(`/projects/${projectId}/issues/${event.issue_id}?context=timeline`)}>
                                             <div className="flex items-center gap-2 mb-1">
                                                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                                                     event.type === 'created' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                 }`}>
                                                     {event.type}
                                                 </span>
                                                 <span className="text-xs font-semibold text-[#6B778C]">{event.story_code}</span>
                                             </div>
                                             <div className="text-sm font-medium text-[#172B4D] mb-0.5">
                                                 {event.title}
                                             </div>
                                             {event.description && (
                                                 <div className="text-xs text-[#5E6C84] line-clamp-2">
                                                     {event.description}
                                                 </div>
                                             )}
                                         </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {events.length === 0 && (
                        <div className="pl-8 text-gray-500 italic">No activity found in this period.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TimelinePage;
