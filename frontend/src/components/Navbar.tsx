import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Moon, Sun, LogOut, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  isDark: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar = ({ isDark, onToggleDarkMode }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoggedIn, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Lectures", path: "/lectures" },
    { name: "Notes", path: "/notes" },
    { name: "Tasks", path: "/tasks" },
    { name: "Daily Notes", path: "/daily-notes" },
    { name: "About", path: "/about" },
  ];

  const adminItems = [
    { name: "Manage Lectures", path: "/admin/lectures" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 w-full z-50 ${
        isDark
          ? "bg-slate-950/40 border-b border-slate-700/30"
          : "bg-white/40 border-b border-white/30"
      } glass backdrop-blur-md`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">PJ</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Placement Journey
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-medium transition-colors duration-300 ${
                  isDark
                    ? "text-slate-300 hover:text-indigo-400"
                    : "text-slate-700 hover:text-indigo-600"
                }`}
              >
                {item.name}
              </Link>
            ))}
            {isAdmin && adminItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-medium transition-colors duration-300 px-3 py-1 rounded-lg ${
                  isDark
                    ? "text-amber-400 hover:bg-amber-500/20 border border-amber-500/30"
                    : "text-amber-700 hover:bg-amber-100 border border-amber-200"
                }`}
              >
                {item.name} ⭐
              </Link>
            ))}
          </div>

          {/* Theme Toggle & Auth Buttons */}
          <div className="flex items-center gap-4">
            {isLoggedIn && (
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}
                >
                  {user?.name || user?.email}
                </span>
                <button
                  onClick={logout}
                  className={`px-3 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 ${
                    isDark
                      ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                      : "bg-red-100 text-red-600 hover:bg-red-200 border border-red-200"
                  }`}
                  title="Logout"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}

            {!isLoggedIn && (
              <button
                onClick={() => navigate('/auth')}
                className={`px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 ${
                  isDark
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                }`}
              >
                <LogIn size={18} />
                <span className="hidden sm:inline">Login</span>
              </button>
            )}

            <button
              onClick={onToggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? "bg-slate-800/50 text-yellow-400 hover:bg-slate-700/50"
                  : "bg-white/50 text-slate-700 hover:bg-white/70"
              }`}
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                isDark
                  ? "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
                  : "bg-white/50 text-slate-700 hover:bg-white/70"
              }`}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`md:hidden pb-4 space-y-2 ${
              isDark ? "bg-slate-900/50" : "bg-white/30"
            } rounded-b-lg`}
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  isDark
                    ? "text-slate-300 hover:bg-slate-800/50"
                    : "text-slate-700 hover:bg-white/50"
                }`}
              >
                {item.name}
              </Link>
            ))}
            {isAdmin && adminItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg transition-colors border-l-2 ${
                  isDark
                    ? "text-amber-400 hover:bg-amber-500/20 border-amber-500"
                    : "text-amber-700 hover:bg-amber-100 border-amber-200"
                }`}
              >
                {item.name} ⭐
              </Link>
            ))}
            {isLoggedIn && (
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  isDark
                    ? "text-red-400 hover:bg-slate-800/50"
                    : "text-red-600 hover:bg-white/50"
                }`}
              >
                <LogOut size={18} />
                Logout
              </button>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

