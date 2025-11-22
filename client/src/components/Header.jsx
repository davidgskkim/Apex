import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="bg-slate-950 border-b border-violet-900/30 h-16 relative z-50 shadow-lg shadow-violet-900/5">
      <div className="max-w-6xl mx-auto h-full flex items-center px-4 relative">
        
        {/* --- 1. THE LOGO (ABSOLUTE CENTER) --- */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Link to="/" className="flex items-center gap-2 group">
            
            {/* The "Fractured Peak" Icon (SVG) */}
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]">
              {/* The Left Slope */}
              <path d="M12 2L2 19H8L12 12" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-violet-400 transition-colors"/>
              {/* The Right Slope */}
              <path d="M12 2L22 19H16L12 12" stroke="#d946ef" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-fuchsia-400 transition-colors"/>
              {/* The Base/Crossbar */}
              <path d="M8 19H16" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-violet-400 transition-colors"/>
            </svg>

            {/* Text Logo */}
            <span 
              style={{ fontFamily: "'Orbitron', sans-serif" }} 
              className="text-2xl font-black tracking-[0.2em] text-white group-hover:text-violet-200 transition-colors"
            >
              APEX
            </span>
          </Link>
        </div>

        {/* --- 2. NAVIGATION (PINNED RIGHT) --- */}
        {token && (
          <div className="ml-auto">
            <button 
              onClick={handleLogout}
              className="text-xs font-bold text-slate-400 hover:text-white border border-slate-800 hover:border-violet-500 px-3 py-1.5 rounded transition-all duration-200 uppercase tracking-wider"
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;