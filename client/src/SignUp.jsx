import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserIcon, LockClosedIcon, BriefcaseIcon } from '@heroicons/react/24/solid';

const SignUp = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Staff');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axios.post('http://localhost:5001/api/register', { username, password, role });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || "Registration failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 glass-panel p-10 rounded-2xl">
                <div>
                    <h2 className="mt-2 text-center text-4xl font-extrabold text-white tracking-tight">
                        Join Nexus
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-200">
                        Create an account to get started
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon className="h-5 w-5 text-gray-300" aria-hidden="true" />
                            </div>
                            <input
                                type="text"
                                required
                                className="glass-input block w-full pl-10 pr-3 py-3 rounded-lg sm:text-sm"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockClosedIcon className="h-5 w-5 text-gray-300" aria-hidden="true" />
                            </div>
                            <input
                                type="password"
                                required
                                className="glass-input block w-full pl-10 pr-3 py-3 rounded-lg sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <BriefcaseIcon className="h-5 w-5 text-gray-300" aria-hidden="true" />
                            </div>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="glass-input block w-full pl-10 pr-3 py-3 rounded-lg sm:text-sm appearance-none"
                            >
                                <option value="Staff" className="text-gray-900">Staff</option>
                                <option value="Admin" className="text-gray-900">Admin</option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-200 bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-sm text-center backdrop-blur-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 shadow-lg transform transition hover:scale-105"
                        >
                            Sign Up
                        </button>
                    </div>

                    <div className="text-center">
                        <Link to="/login" className="text-sm text-gray-200 hover:text-white transition-colors">
                            Already have an account? Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUp;
