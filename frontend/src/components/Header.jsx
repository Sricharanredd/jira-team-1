import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/userUtils';
import GlobalSearch from './GlobalSearch';

const Header = () => {
    const { currentUser, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const buttonRef = useRef(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const location = useLocation();

    useEffect(() => {
        if (isMenuOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY + 8,
                left: rect.right + window.scrollX - 192 // 192px is w-48
            });
        }
    }, [isMenuOpen]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (buttonRef.current && !buttonRef.current.contains(event.target)) {
                 // Check if click is inside the portal payload (will need a ref or ID for that, ideally)
                 // Or simple approach: Just close it if it's not the button. 
                 // Issue: clicking inside the dropdown will close it if we aren't careful.
                 // Better: Pass a ref to the dropdown.
            }
        };
        
        if(isMenuOpen) {
            // We need a separate listener or a overlay for the portal. 
            // Using a transparency overlay approach is safer/easier for portals.
            // Implemented below in the portal.
        }
    }, [isMenuOpen]);


    return (
        <div className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 flex-shrink-0 z-20 relative">
            <div className="font-medium text-gray-500">Workspace</div>
            <div className="flex items-center space-x-4">

                <GlobalSearch />
                
                {/* User Menu */}
                <div className="relative">
                    <button 
                        ref={buttonRef}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center space-x-2 focus:outline-none"
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                            {getInitials(currentUser?.name)}
                        </div>
                    </button>

                    {isMenuOpen && createPortal(
                        <>
                            {/* Backdrop to handle click outside */}
                            <div 
                                className="fixed inset-0 z-[9998]" 
                                onClick={() => setIsMenuOpen(false)}
                            />
                            {/* Dropdown Menu */}
                            <div 
                                className="fixed bg-white rounded-md shadow-lg py-1 border border-gray-200 z-[9999] w-48"
                                style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
                            >
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900 truncate">{currentUser?.name || 'User'}</p>
                                    <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                                </div>
                                <Link 
                                    to={location.pathname.startsWith('/projects/') && location.pathname.split('/')[2]
                                        ? `/projects/${location.pathname.split('/')[2]}/profile`
                                        : "/profile"
                                    }
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Profile
                                </Link>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        logout();
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                >
                                    Logout
                                </button>
                            </div>
                        </>,
                        document.body
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;
