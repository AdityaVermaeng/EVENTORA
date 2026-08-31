import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaTicketAlt, FaShieldAlt } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-gray-900 shadow-lg border-b border-gray-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4">
                    <Link to="/" className="text-white text-2xl font-black flex items-center gap-2 tracking-tight">
                        <FaTicketAlt className="text-gray-300" /> Eventora
                    </Link>
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                        <Link to="/" className="text-gray-300 hover:text-white font-medium transition cursor-pointer">Events</Link>
                        {user ? (
                            <>
                                <Link
                                    to={user.role === 'admin' ? '/admin' : '/dashboard'}
                                    className="text-gray-300 hover:text-white font-medium transition flex items-center gap-2"
                                >
                                    Dashboard
                                    {user.role === 'admin' && (
                                        <span className="bg-linear-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-sm flex items-center gap-1">
                                            <FaShieldAlt className="text-[9px]" /> Admin
                                        </span>
                                    )}
                                </Link>
                                <span className="text-gray-400 text-sm font-semibold hidden md:inline">
                                    {user.name}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-gray-800 hover:bg-black text-white text-sm px-4 py-2 rounded-xl font-bold transition border border-gray-700 hover:border-gray-500"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-300 hover:text-white font-medium transition">Login</Link>
                                <Link to="/register" className="bg-white text-gray-900 hover:bg-gray-100 px-5 py-2 rounded-xl font-bold transition shadow-sm">Sign Up</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;