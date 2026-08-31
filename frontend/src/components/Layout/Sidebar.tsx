import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Activity, ClipboardList, Cpu, Brain,
  FlaskConical, ShieldCheck, TrendingUp, Calendar, BarChart3,
  BookOpen, FileText, FileOutput, Scale, Settings, Info,
  ChevronLeft, ChevronRight, Stethoscope, X,
} from 'lucide-react';
import { StatusBadge } from '../UI/StatusBadge';
import { useAppStore } from '../../store';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Overview / Hero' },
  { path: '/overview', icon: Activity, label: 'Scientific Flow' },
  { path: '/dashboard', icon: Stethoscope, label: 'Clinical Command' },
  { path: '/assessment', icon: ClipboardList, label: 'Patient Intake' },
  { path: '/prediction', icon: Cpu, label: 'Prediction Engine' },
  { path: '/explainability', icon: Brain, label: 'XAI Explainability' },
  { path: '/models', icon: FlaskConical, label: 'Model Laboratory' },
  { path: '/validation', icon: ShieldCheck, label: 'Validation' },
  { path: '/clinical-utility', icon: TrendingUp, label: 'Clinical Utility' },
  { path: '/followup', icon: Calendar, label: 'Follow-Up' },
  { path: '/research', icon: BarChart3, label: 'Research Data' },
  { path: '/methodology', icon: BookOpen, label: 'Methodology' },
  { path: '/crf', icon: FileText, label: 'CRF Master' },
  { path: '/reports', icon: FileOutput, label: 'AI Reports' },
  { path: '/ethics', icon: Scale, label: 'Ethics & Consent' },
  { path: '/settings', icon: Settings, label: 'Settings' },
  { path: '/about', icon: Info, label: 'About & Model Card' },
];

interface SidebarContentProps {
  onNavigate?: () => void;
  collapsed?: boolean;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ onNavigate, collapsed = false }) => (
  <div className="flex flex-col h-full bg-white text-[#0F172A]">
    {/* Brand Header */}
    <div className="h-16 flex items-center px-4 border-b border-[#E2E8F0] shrink-0 justify-between">
      <div className="flex items-center space-x-3 overflow-hidden">
        <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center shrink-0">
          <Brain className="w-5 h-5 text-[#0F766E]" />
        </div>
        {!collapsed && (
          <div className="leading-tight truncate">
            <h1 className="font-bold text-sm tracking-tight text-[#0F172A]">NeuroClarity</h1>
            <p className="text-[10px] text-[#0F766E] font-semibold tracking-wider uppercase">XAI-CDSS Enterprise</p>
          </div>
        )}
      </div>
    </div>

    {/* Navigation Items */}
    <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-[#F0FDFA] text-[#0F766E] border-l-[3px] border-[#0F766E] font-semibold shadow-xs'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="ml-3 truncate">{item.label}</span>}
            {collapsed && (
              <div className="absolute left-14 bg-[#0F172A] text-white text-[11px] py-1 px-2.5 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-50">
                {item.label}
              </div>
            )}
          </NavLink>
        );
      })}
    </div>

    {/* Footer Status */}
    <div className="p-3.5 border-t border-[#E2E8F0] bg-[#F8FAFC] shrink-0">
      {!collapsed ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <StatusBadge status="DEMO COHORT" size="sm" />
            <span className="text-[11px] text-[#64748B] font-medium">v1.2 Enterprise</span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-[#64748B]">
            <span className="w-2 h-2 rounded-full bg-[#059669] telemetry-pulse" />
            <span className="font-medium text-[#334155]">Inference Engine Online</span>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <span className="w-2 h-2 rounded-full bg-[#059669] telemetry-pulse" />
        </div>
      )}
    </div>
  </div>
);

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const { mobileMenuOpen, setMobileMenuOpen } = useAppStore();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, setMobileMenuOpen]);

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 252 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="hidden md:flex h-screen bg-white border-r border-[#E2E8F0] flex-col shrink-0 z-30 shadow-xs relative"
      >
        <SidebarContent collapsed={collapsed} />

        {/* Collapse toggle button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-[#CBD5E1] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shadow-xs z-50 cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.aside>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs z-40 md:hidden"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-[#E2E8F0] z-50 md:hidden flex flex-col shadow-xl"
            >
              {/* Close button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition-colors z-10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <SidebarContent onNavigate={() => setMobileMenuOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
