import React from 'react';
import {
  Calendar,
  Search,
  Network,
  Sparkles,
  Table,
  BookOpen,
  Building2,
  Users,
  RotateCcw,
  Download,
  CheckCircle2,
  AlertCircle,
  LogOut,
  User,
  Shield,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../auth/AuthContext';

export type NavTab =
  | 'dashboard'
  | 'vacant-rooms'
  | 'graph-coloring'
  | 'generator'
  | 'final-timetable'
  | 'subjects'
  | 'classrooms'
  | 'students';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenExportModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenExportModal,
  onLogout,
}) => {
  const { timetableMetadata, validationReport, resetToDemoData } = useApp();
  const { user, signOut, authMode } = useAuth();

  const handleLogoutClick = async () => {
    if (window.confirm('Are you sure you want to log out of ExamForge?')) {
      await signOut();
      onLogout();
    }
  };

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string; highlight?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Calendar className="w-4 h-4" /> },
    {
      id: 'vacant-rooms',
      label: 'Find Vacant Classrooms',
      icon: <Search className="w-4 h-4" />,
      badge: 'PRO Showcase',
      highlight: true,
    },
    {
      id: 'graph-coloring',
      label: 'Graph Coloring',
      icon: <Network className="w-4 h-4" />,
      badge: 'Discrete Math',
    },
    { id: 'generator', label: 'Generate Timetable', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'final-timetable', label: 'Final Timetable', icon: <Table className="w-4 h-4" /> },
    { id: 'subjects', label: 'Subjects', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'classrooms', label: 'Classrooms', icon: <Building2 className="w-4 h-4" /> },
    { id: 'students', label: 'Students', icon: <Users className="w-4 h-4" /> },
  ];

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-white/60 shadow-xs">
      {/* Top Banner with College Info and Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#438DFF] to-[#A78BFA] flex items-center justify-center text-white shadow-sm shadow-[#438DFF]/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-[#0F172A]">
                  Exam<span className="text-[#438DFF]">Forge</span>
                </span>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#EAF4FF] text-[#438DFF] rounded-full border border-[#438DFF]/20">
                  v2.0
                </span>
                {validationReport.isValid ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Conflict-Free
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    {validationReport.errorCount} Issues
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Intelligent Examination Timetable Generator Using Graph Coloring
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
              <span className="font-semibold text-slate-800">{timetableMetadata.semesterName}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">Status:</span>
              <span
                className={`font-medium px-1.5 py-0.2 rounded text-[10px] ${
                  timetableMetadata.status === 'SAVED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {timetableMetadata.status}
              </span>
            </div>

            {/* Quick Export Button */}
            <button
              onClick={onOpenExportModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition"
              title="Export Timetables, Room Allocation, and Vacancy Reports (Excel & CSV)"
            >
              <Download className="w-3.5 h-3.5 text-[#438DFF]" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={() => {
                if (window.confirm('Reset all data to the default college scenario dataset?')) {
                  resetToDemoData();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              title="Reset to default college sample scenario"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset Demo</span>
            </button>

            {/* Authenticated User Profile Badge & Logout Button */}
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="flex items-center gap-2 py-1 px-2.5 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#438DFF] to-[#A78BFA] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {userInitials}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-xs font-bold text-[#0F172A] line-clamp-1 max-w-[140px]">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono line-clamp-1 max-w-[140px] flex items-center gap-1">
                      <Shield className="w-2.5 h-2.5 text-emerald-500" />
                      <span>{authMode === 'SUPABASE' ? 'Supabase' : 'Verified'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogoutClick}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="Sign Out of ExamForge"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <nav className="bg-white/70 backdrop-blur-sm border-t border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? item.highlight
                      ? 'bg-[#438DFF] text-white shadow-xs font-semibold'
                      : 'bg-white text-[#438DFF] shadow-xs border border-slate-200/80 font-semibold'
                    : item.highlight
                    ? 'text-[#438DFF] bg-[#EAF4FF] hover:bg-[#D9EBFF]'
                    : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-200/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                      isActive && item.highlight
                        ? 'bg-white/20 text-white'
                        : item.highlight
                        ? 'bg-[#438DFF] text-white'
                        : 'bg-[#A78BFA]/20 text-[#7C3AED]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
