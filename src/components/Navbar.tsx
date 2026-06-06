import { Link, useNavigate } from 'react-router-dom';
import { Film, User, LogOut, LogIn, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function Navbar() {
  const { isAuthenticated, username, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-950 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
          <Film className="text-indigo-400" size={24} />
          <span>CineList</span>
        </Link>

        {isAuthenticated && (
          <Link
            to="/recommendations"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <Sparkles size={16} />
            Recommendations
          </Link>
        )}

        {/*
        <Link to="/explainer" className="...">
          Math Log
        </Link>
        */}

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <User size={18} />
                <span className="text-sm">{username}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors text-sm"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm"
            >
              <LogIn size={18} />
              Sign In
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}