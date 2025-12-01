import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_URL from './config';
import { HomeIcon, CubeIcon, CurrencyDollarIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

// --- Auth Context ---
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = async (username, password) => {
        try {
            const res = await axios.post(`${API_URL}/api/login`, { username, password });
            setUser(res.data.user);
            return true;
        } catch (error) {
            console.error("Login failed", error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

// --- Protected Route Component ---
const ProtectedRoute = ({ children, roles }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
    return children;
};

// --- Layout Component ---
const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50/50">
            <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="font-extrabold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
                                    Nexus
                                </span>
                            </div>
                            {user && (
                                <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                                    <Link
                                        to="/"
                                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                                            isActive('/')
                                                ? 'border-purple-500 text-gray-900'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <HomeIcon className="h-5 w-5 mr-1.5" />
                                        Dashboard
                                    </Link>
                                    {user.role === 'Admin' && (
                                        <Link
                                            to="/inventory"
                                            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                                                isActive('/inventory')
                                                    ? 'border-purple-500 text-gray-900'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            <CubeIcon className="h-5 w-5 mr-1.5" />
                                            Inventory
                                        </Link>
                                    )}
                                    {user.role === 'Staff' && (
                                        <Link
                                            to="/sales"
                                            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                                                isActive('/sales')
                                                    ? 'border-purple-500 text-gray-900'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            <CurrencyDollarIcon className="h-5 w-5 mr-1.5" />
                                            Sales
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center">
                            {user ? (
                                <div className="flex items-center space-x-4">
                                    <div className="flex flex-col text-right mr-2">
                                        <span className="text-sm font-semibold text-gray-900">{user.username}</span>
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">{user.role}</span>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200"
                                        title="Logout"
                                    >
                                        <ArrowRightOnRectangleIcon className="h-6 w-6" />
                                    </button>
                                </div>
                            ) : (
                                <Link to="/login" className="text-purple-600 hover:text-purple-900 font-medium">Login</Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
};

// --- Lazy Load Components ---
import Login from './Login';
import SignUp from './SignUp';
import Dashboard from './Dashboard';
import Inventory from './Inventory';
import Sales from './Sales';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/*" element={
                        <Layout>
                            <Routes>
                                <Route path="/" element={
                                    <ProtectedRoute roles={['Admin', 'Staff']}>
                                        <Dashboard />
                                    </ProtectedRoute>
                                } />
                                <Route path="/inventory" element={
                                    <ProtectedRoute roles={['Admin']}>
                                        <Inventory />
                                    </ProtectedRoute>
                                } />
                                <Route path="/sales" element={
                                    <ProtectedRoute roles={['Staff']}>
                                        <Sales />
                                    </ProtectedRoute>
                                } />
                            </Routes>
                        </Layout>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
