import React, { useState, useEffect } from 'react';
import { Bell, Search, X, Menu, Brain, Activity, User, Database, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import { getHealth } from '../../services/api';

interface TopBarProps {
  title?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title = 'Clinical Command' }) => {
  const { notifications, removeNotification, setMobileMenuOpen, mobileMenuOpen } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [systemHealth, setSystemHealth] = useState<{
    database?: string;
    models_count?: number;
    patients_in_database?: number;
  }>({
    database: 'Connected',
    models_count: 4,
    patients_in_database: 320
  });

  useEffect(() => {
    getHealth()
      .then((h) => setSystemHealth(h))
      .catch(() => {
        setSystemHealth({ database: 'Disconnected' });
      });
  }, []);

  const isDbConnected = systemHealth.database === 'Connected';

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-4 md:px-6 flex items-center justify-between shrink-0 z-20 shadow-2xs">
      {/* Left: Hamburger (mobile) + Title & Subtitle */}
      <div className="flex items-center space-x-3">
        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569] transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile brand logo */}
        <div className="flex items-center space-x-2 md:hidden">
          <div className="w-7 h-7 rounded-lg bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center">
            <Brain className="w-4 h-4 text-[#0F766E]" />
          </div>
          <span className="font-bold text-sm text-[#0F172A] tracking-tight">NeuroClarity</span>
        </div>

        {/* Desktop title and subtitle */}
        <div className="hidden md:block">
          <h2 className="text-base font-bold text-[#0F172A] tracking-tight">{title}</h2>
          <p className="text-xs text-[#64748B] font-medium">Explainable AI Clinical Decision Support System</p>
        </div>

        {/* Real Data-Driven Status Telemetry Indicators */}
        <div className="hidden lg:flex items-center space-x-4 pl-5 border-l border-[#E2E8F0] text-xs">
          <div className={`flex items-center space-x-1.5 ${isDbConnected ? 'text-[#059669]' : 'text-[#DC2626]'}`}>
            <span className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-[#059669] telemetry-pulse' : 'bg-[#DC2626]'}`} />
            <span className="text-[#334155] font-semibold">
              {isDbConnected ? `DB Connected (N=${systemHealth.patients_in_database || 320})` : 'DB Offline'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-[#0F766E]">
            <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
            <span className="text-[#334155] font-semibold">
              {systemHealth.models_count || 4} ML Models Online
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-[#0284C7]">
            <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
            <span className="text-[#334155] font-semibold">Synthetic Cohort v2.0</span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Search button */}
        <div className="relative">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] transition-colors cursor-pointer"
            title="Search clinical database"
          >
            <Search className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                className="absolute right-0 mt-2 w-72 md:w-80 bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-lg z-50"
              >
                <div className="flex items-center bg-[#F8FAFC] rounded-lg px-2.5 py-1.5 border border-[#CBD5E1]">
                  <Search className="w-3.5 h-3.5 text-[#64748B] mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search Patient ID, scale, medication..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none w-full"
                    autoFocus
                  />
                  <button onClick={() => setShowSearch(false)} className="text-[#94A3B8] hover:text-[#0F172A] ml-1 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] transition-colors cursor-pointer"
            title="System notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#0F766E]" />
            )}
          </button>
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-72 md:w-80 bg-white border border-[#E2E8F0] rounded-xl p-3.5 shadow-lg z-50"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] mb-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-[#0F172A]">
                    <Activity className="w-3.5 h-3.5 text-[#0F766E]" />
                    <span>Clinical Alerts</span>
                  </div>
                  <button onClick={() => setShowNotifications(false)} className="text-[#94A3B8] hover:text-[#0F172A] cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-start justify-between text-xs group">
                      <div>
                        <p className="text-[#1E293B] text-[11px] leading-snug font-medium">{n.message}</p>
                        <span className="text-[10px] text-[#64748B] mt-1 block">{n.timestamp}</span>
                      </div>
                      <button onClick={() => removeNotification(n.id)} className="text-[#94A3B8] hover:text-[#DC2626] opacity-0 group-hover:opacity-100 transition-opacity ml-2 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Clinician Session Identity */}
        <div className="flex items-center space-x-2 pl-2 md:pl-3 border-l border-[#E2E8F0]">
          <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center text-xs font-bold text-[#0F766E]">
            MD
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-[#0F172A] leading-none">Treating Psychiatrist</p>
            <p className="text-[10px] text-[#059669] font-semibold mt-0.5">Active Session</p>
          </div>
        </div>
      </div>
    </header>
  );
};
