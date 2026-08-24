import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { 
  LayoutDashboard, 
  MessageCircle, 
  Brain, 
  BarChart3, 
  Heart, 
  BookOpen, 
  User,
  Shield,
  Menu,
  X,
  LogOut,
  LogIn,
  Sun,
  Moon,
  Globe,
  MonitorPlay,
  Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'es' : i18n.language === 'es' ? 'hi' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const navItems = [
    { name: t('nav.dashboard', 'Dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { name: t('nav.shield_ai', 'Shield AI'), path: '/assistant', icon: MessageCircle },
    { name: t('nav.talk_to_ai', 'Talk to AI 🎙️'), path: '/voice', icon: MessageCircle },
    { name: t('nav.insights', 'Insights'), path: '/insights', icon: Brain },
    { name: t('nav.analytics', 'Analytics'), path: '/analytics', icon: BarChart3 },
    { name: t('nav.toolkit', 'Toolkit'), path: '/toolkit', icon: Heart },
    { name: t('nav.journal', 'Journal'), path: '/journal', icon: BookOpen },
    { name: t('nav.profile', 'Profile'), path: '/profile', icon: User },
    { name: t('nav.demo', 'Demo Mode'), path: '/demo', icon: MonitorPlay },
    { name: t('nav.sih_explain', 'SIH Explainer'), path: '/sih-explain', icon: Info },
  ];

  return (
    <div className="flex h-screen overflow-hidden font-sans transition-colors duration-300 bg-gray-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="p-6 flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl">
            <Shield className="w-8 h-8 text-blue-500 dark:text-blue-400" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
            MindShield
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-medium' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                {item.name}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-slate-800/60 space-y-2">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-all"
            >
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </div>
            </button>
            <button
              onClick={toggleLanguage}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5" />
                <span>{i18n.language.toUpperCase()}</span>
              </div>
            </button>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-slate-800/60">
             {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
                      {(user.display_name || user.username || 'U')[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {user.display_name || user.username || 'User'}
                      </span>
                      <span className="text-[11px] text-gray-400 truncate">{user.email || 'Authenticated'}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      logout();
                      toast.success('Logged out successfully');
                      navigate('/');
                    }} 
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link to="/login" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all font-medium">
                  <LogIn className="w-5 h-5" />
                  <span>Login / Sign Up</span>
                </Link>
              )}
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden transition-colors duration-300 bg-gray-50 dark:bg-slate-950">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            <span className="font-bold text-gray-800 dark:text-slate-100">MindShield</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 text-gray-500 dark:text-slate-400">
               {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden absolute top-[73px] left-0 right-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800/50 z-20 shadow-xl"
            >
              <nav className="px-4 py-2 space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                        isActive ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : 'text-gray-600 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4 md:p-8 pb-24 md:pb-8 min-h-full">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-t border-gray-200 dark:border-slate-800/50 flex justify-around p-3 pb-safe z-30">
        {navItems.slice(0, 5).map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-2 ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-slate-500 hover:text-gray-800 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MainLayout;
