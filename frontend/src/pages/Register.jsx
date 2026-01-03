import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('VIEWER');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Password Rules
    const rules = [
        { label: "At least 8 characters", valid: password.length >= 8 },
        { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
        { label: "One lowercase letter", valid: /[a-z]/.test(password) },
        { label: "One number", valid: /\d/.test(password) },
        { label: "One special character", valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];

    const allRulesMet = rules.every(r => r.valid);
    const passwordsMatch = password === confirmPassword && confirmPassword !== '';

    // Calculate Strength
    const getStrength = () => {
        const metCount = rules.filter(r => r.valid).length;
        if (metCount <= 2) return { label: 'Weak', color: 'bg-red-500', text: 'text-red-500' };
        if (metCount <= 4) return { label: 'Medium', color: 'bg-yellow-500', text: 'text-yellow-500' };
        return { label: 'Strong', color: 'bg-green-500', text: 'text-green-500' };
    };

    const strength = getStrength();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Email Validation (Strict format with TLD)
        // Regex: something@something.something (at least 2 chars after last dot)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(email)) {
             setError("Please enter a valid email address (e.g., user@example.com)");
             return;
        }

        if (!allRulesMet) {
            setError("Password does not meet all complexity requirements.");
            return;
        }

        if (!passwordsMatch) {
            setError("Passwords do not match.");
            return;
        }

        try {
            await register(name, email, password, confirmPassword, role);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7] py-10">
            <div className="bg-white p-8 rounded-md shadow-sm w-[440px] border border-gray-200">
                <h2 className="text-2xl font-medium text-[#172B4D] mb-8 text-center">Create account</h2>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-6 text-sm border border-red-100">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-[#6B778C] uppercase tracking-wide mb-2">Full Name</label>
                        <input 
                            type="text" 
                            className="block w-full border border-gray-300 rounded px-3 py-2 text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Enter your full name"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#6B778C] uppercase tracking-wide mb-2">Email</label>
                        <input 
                            type="email" 
                            className="block w-full border border-gray-300 rounded px-3 py-2 text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                        />
                    </div>
                    
                    {/* Password Input */}
                    <div>
                        <label className="block text-xs font-semibold text-[#6B778C] uppercase tracking-wide mb-2">Password</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"}
                                className="block w-full border border-gray-300 rounded px-3 py-2 pr-10 text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Create a password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-[#172B4D] cursor-pointer transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {/* Strength Indicator */}
                        {password && (
                            <div className="mt-3">
                                <div className="flex justify-between text-xs mb-1.5 align-middle">
                                    <span className="text-[#6B778C]">Strength</span>
                                    <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-300 ${strength.color}`} 
                                        style={{ width: `${(rules.filter(r => r.valid).length / 5) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="block text-xs font-semibold text-[#6B778C] uppercase tracking-wide mb-2">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="block w-full border border-gray-300 rounded px-3 py-2 text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                            <option value="VIEWER">Viewer (Read Only)</option>
                            <option value="DEVELOPER">Developer</option>
                            <option value="TESTER">Tester</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Select your primary role.
                        </p>
                    </div>

                    {/* Rule Checklist */}
                    {password && (
                        <div className="bg-gray-50 p-3 rounded border border-gray-100">
                            <p className="text-xs font-semibold text-[#6B778C] mb-2 uppercase tracking-wide">Password Requirements</p>
                            <div className="space-y-1">
                                {rules.map((rule, idx) => (
                                    <div key={idx} className={`flex items-center text-xs ${rule.valid ? 'text-green-600 font-medium' : 'text-[#6B778C]'}`}>
                                        <span className={`mr-2 flex-shrink-0 ${rule.valid ? 'text-green-500' : 'text-gray-300'}`}>
                                            {rule.valid ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            )}
                                        </span>
                                        {rule.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-xs font-semibold text-[#6B778C] uppercase tracking-wide mb-2">Confirm Password</label>
                        <div className="relative">
                            <input 
                                type={showConfirmPassword ? "text" : "password"}
                                className="block w-full border border-gray-300 rounded px-3 py-2 pr-10 text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="Confirm your password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-[#172B4D] cursor-pointer transition-colors"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showConfirmPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {password && confirmPassword && !passwordsMatch && (
                            <p className="text-xs text-red-500 mt-2 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Passwords do not match
                            </p>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        disabled={!allRulesMet || !passwordsMatch}
                        className={`w-full py-2 rounded font-medium text-white transition-colors mt-4 ${
                            allRulesMet && passwordsMatch 
                                ? 'bg-[#0052CC] hover:bg-[#0065FF]' 
                                : 'bg-gray-300 cursor-not-allowed opacity-70'
                        }`}
                    >
                        Sign up
                    </button>
                </form>
                <div className="mt-6 text-center text-sm">
                    <span className="text-[#6B778C]">Already have an account? </span>
                    <Link to="/login" className="text-[#0052CC] hover:underline font-medium">Log in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
