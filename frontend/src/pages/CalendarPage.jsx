import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';

const CalendarPage = () => {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarData, setCalendarData] = useState({});
    const [loading, setLoading] = useState(true);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const fetchCalendarData = async () => {
        setLoading(true);
        try {
            const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
            const res = await api.get(`/reports/calendar?month=${monthStr}&project_id=${projectId}`);
            setCalendarData(res.data);
        } catch (error) {
            console.error("Failed to fetch calendar data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCalendarData();
    }, [year, month]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    // Calendar Generation Logic
    const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

    const daysInMonth = getDaysInMonth(year, month);
    const startDay = getFirstDayOfMonth(year, month);
    
    // Generate grid cells
    const cells = [];
    // Empty cells for padding
    for (let i = 0; i < startDay; i++) {
        cells.push(null);
    }
    // Date cells
    for (let i = 1; i <= daysInMonth; i++) {
        cells.push(i);
    }

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="min-h-full flex flex-col bg-white p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-[#172B4D]">Calendar</h1>
                <div className="flex items-center gap-4">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded text-gray-600">
                        &lt; Prev
                    </button>
                    <span className="text-lg font-medium w-32 text-center">
                        {monthNames[month]} {year}
                    </span>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded text-gray-600">
                        Next &gt;
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">Loading...</div>
            ) : (
                <div className="flex-1 border border-gray-200 rounded-lg flex flex-col">
                    {/* Header Row */}
                    <div className="grid grid-cols-7 bg-[#F4F5F7] border-b border-gray-200">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="py-2 text-center text-xs font-bold text-[#5E6C84] uppercase tracking-wide">
                                {day}
                            </div>
                        ))}
                    </div>
                    
                    {/* Days Grid */}
                    <div className="grid grid-cols-7 bg-gray-200 gap-px">
                        {cells.map((day, idx) => {
                            if (!day) return <div key={idx} className="bg-[#FAFBFC]"></div>;
                            
                            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const issues = calendarData[dateStr] || [];
                            
                            return (
                                <div key={idx} className="bg-white p-2 min-h-[140px] hover:bg-gray-50 transition-colors flex flex-col">
                                    <span className={`text-sm font-medium mb-2 ${
                                        new Date().toDateString() === new Date(year, month, day).toDateString() 
                                        ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' 
                                        : 'text-[#172B4D]'
                                    }`}>
                                        {day}
                                    </span>
                                    
                                    <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
                                        {issues.slice(0, 3).map(issue => (
                                            <div 
                                                key={issue.id}
                                                onClick={() => navigate(`/projects/${projectId}/issues/${issue.id}?context=calendar`)}
                                                className="bg-[#DEEBFF] text-[#0747A6] px-2 py-1 rounded-[3px] text-xs truncate cursor-pointer hover:bg-[#B3D4FF] border border-transparent hover:border-[#4C9AFF]"
                                                title={`${issue.story_code}: ${issue.title}`}
                                            >
                                                {issue.story_code}
                                            </div>
                                        ))}
                                        {issues.length > 3 && (
                                            <div className="text-xs text-gray-500 pl-1">
                                                +{issues.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarPage;
