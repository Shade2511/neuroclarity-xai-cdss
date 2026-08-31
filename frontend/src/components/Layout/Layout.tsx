import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { DisclaimerBanner } from '../UI/DisclaimerBanner';
import { ClinicalAIChatbot } from '../AI/ClinicalAIChatbot';
import { ClinicalBackground3D } from '../Motion/ClinicalBackground3D';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const location = useLocation();

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-[#F6F8FB] text-[#0F172A] antialiased font-sans bg-clinical-grid relative">
      {/* Central Reusable Clinical 3D Background Engine */}
      <ClinicalBackground3D />

      {/* Sidebar — responsive drawer on mobile, clean dock on desktop */}
      <Sidebar />

      {/* Main content column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <TopBar title={title} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-6 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <DisclaimerBanner />
      </div>

      {/* Global Clinical AI Assistant Co-Pilot */}
      <ClinicalAIChatbot />
    </div>
  );
};
