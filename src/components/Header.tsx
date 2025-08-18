import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, LogOut, Settings, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
            <img 
              src="/silvermoon-logo.svg" 
              alt="SILVERMOON Logo" 
              className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8"
            />
            <span className="hidden xs:inline">SILVER EVENTOS</span>
            <span className="xs:hidden">SILVER EVENTOS</span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {location.pathname === '/' && (
              <Link
                to="/admin"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 text-sm sm:text-base"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            
            {isAuthenticated && (
              <div className="flex items-center gap-1 sm:gap-2">
                {location.pathname === '/scanner' && (
                  <Link
                    to="/admin/settings"
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200 text-sm sm:text-base"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden md:inline">Configurar Evento</span>
                    <span className="md:hidden">Config</span>
                  </Link>
                )}
                
                {location.pathname === '/admin/settings' && (
                  <Link
                    to="/scanner"
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200 text-sm sm:text-base"
                  >
                    <Camera className="w-4 h-4" />
                    <span className="hidden sm:inline">Scanner</span>
                  </Link>
                )}
                
                <button
                  onClick={logout}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 text-sm sm:text-base"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;