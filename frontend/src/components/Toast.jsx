import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    if (!message) return null;

    const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';

    return (
        <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded shadow-lg z-50 animate-fade-in-up flex items-center`}>
            <span className="mr-2 text-xl">
                {type === 'success' ? '✓' : '⚠'}
            </span>
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 hover:text-gray-200 font-bold">✕</button>
        </div>
    );
};

export default Toast;
