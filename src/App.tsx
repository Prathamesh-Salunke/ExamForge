import React, { useState, useEffect } from 'react';
import { useAuth } from './auth/AuthContext';
import { useApp } from './context/AppContext';
import { Navbar, NavTab } from './components/Navbar';
import { AcademicThreeBackground } from './components/ThreeBackground/AcademicThreeBackground';
import { LoginPage } from './components/Auth/LoginPage';
import { SignupPage } from './components/Auth/SignupPage';
import { ForgotPasswordPage } from './components/Auth/ForgotPasswordPage';
import { StatCards } from './components/Dashboard/StatCards';
import { CollegeScenarioCard } from './components/Dashboard/CollegeScenarioCard';
import { NextExamsPreview } from './components/Dashboard/NextExamsPreview';
import { VacantClassroomFinder } from './components/VacantClassrooms/VacantClassroomFinder';
import { GraphVisualization } from './components/GraphColoring/GraphVisualization';
import { AlgorithmExplainer } from './components/GraphColoring/AlgorithmExplainer';
import { ConflictMatrix } from './components/GraphColoring/ConflictMatrix';
import { TimetableGenerator } from './components/TimetableGenerator/TimetableGenerator';
import { FinalTimetableView } from './components/FinalTimetable/FinalTimetableView';
import { SubjectManager } from './components/Subjects/SubjectManager';
import { ClassroomManager } from './components/Classrooms/ClassroomManager';
import { StudentManager } from './components/Students/StudentManager';
import { ExportModal } from './components/Export/ExportModal';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Loader2,
} from 'lucide-react';

export const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgot-password'>('login');
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<NavTab>('dashboard');
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);

  const {
    subjects,
    conflictEdges,
    coloringResult,
    scheduledExams,
    toasts,
    removeToast,
  } = useApp();

  // Sync hash routing if user enters via URL (e.g. #login, #signup, #vacant-rooms)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash === 'signup') {
        setAuthView('signup');
      } else if (hash === 'forgot-password') {
        setAuthView('forgot-password');
      } else if (hash === 'login') {
        setAuthView('login');
      } else if (
        [
          'dashboard',
          'vacant-rooms',
          'graph-coloring',
          'generator',
          'final-timetable',
          'subjects',
          'classrooms',
          'students',
        ].includes(hash)
      ) {
        if (isAuthenticated) {
          setCurrentTab(hash as NavTab);
        } else {
          setRedirectAfterLogin(hash as NavTab);
          setAuthView('login');
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated]);

  // Loading Screen to prevent flicker during auth restore
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative bg-gradient-to-br from-[#EAF4FF]/60 via-[#F8FAFC] to-[#F5F3FF]/60 font-sans">
        <AcademicThreeBackground />
        <div className="p-8 bg-white/90 backdrop-blur-xl border border-white/80 rounded-3xl shadow-xl flex flex-col items-center text-center max-w-sm w-full mx-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#438DFF] to-[#A78BFA] flex items-center justify-center text-white mb-4 shadow-lg shadow-[#438DFF]/25 animate-pulse">
            <Calendar className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-[#0F172A]">ExamForge Verification</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Restoring Academic Examination Session...
          </p>
          <Loader2 className="w-6 h-6 text-[#438DFF] animate-spin" />
        </div>
      </div>
    );
  }

  // Public Unauthenticated State (Login, Signup, Forgot Password)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative font-sans">
        <AcademicThreeBackground />

        {authView === 'login' && (
          <LoginPage
            onNavigateToSignup={() => {
              setAuthView('signup');
              window.location.hash = 'signup';
            }}
            onNavigateToForgotPassword={() => {
              setAuthView('forgot-password');
              window.location.hash = 'forgot-password';
            }}
            onLoginSuccess={() => {
              setCurrentTab(redirectAfterLogin);
              window.location.hash = redirectAfterLogin;
            }}
          />
        )}

        {authView === 'signup' && (
          <SignupPage
            onNavigateToLogin={() => {
              setAuthView('login');
              window.location.hash = 'login';
            }}
            onSignupSuccess={() => {
              setCurrentTab(redirectAfterLogin);
              window.location.hash = redirectAfterLogin;
            }}
          />
        )}

        {authView === 'forgot-password' && (
          <ForgotPasswordPage
            onNavigateToLogin={() => {
              setAuthView('login');
              window.location.hash = 'login';
            }}
          />
        )}
      </div>
    );
  }

  // Protected Authenticated Application State
  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      {/* 3D Animated Background Ambient Environment */}
      <AcademicThreeBackground />

      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.location.hash = tab;
        }}
        onOpenExportModal={() => setExportModalOpen(true)}
        onLogout={() => {
          setAuthView('login');
          window.location.hash = 'login';
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative z-10">
        {/* Tab 1: Dashboard */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            <StatCards
              onNavigateToVacant={() => {
                setCurrentTab('vacant-rooms');
                window.location.hash = 'vacant-rooms';
              }}
              onNavigateToGenerator={() => {
                setCurrentTab('generator');
                window.location.hash = 'generator';
              }}
              onNavigateToGraph={() => {
                setCurrentTab('graph-coloring');
                window.location.hash = 'graph-coloring';
              }}
            />

            <CollegeScenarioCard
              onFindVacant={() => {
                setCurrentTab('vacant-rooms');
                window.location.hash = 'vacant-rooms';
              }}
              onGenerate={() => {
                setCurrentTab('generator');
                window.location.hash = 'generator';
              }}
              onViewGraph={() => {
                setCurrentTab('graph-coloring');
                window.location.hash = 'graph-coloring';
              }}
            />

            <NextExamsPreview
              exams={scheduledExams}
              onViewAll={() => {
                setCurrentTab('final-timetable');
                window.location.hash = 'final-timetable';
              }}
            />
          </div>
        )}

        {/* Tab 2: Find Vacant Classrooms (KEY SHOWCASE FEATURE) */}
        {currentTab === 'vacant-rooms' && <VacantClassroomFinder />}

        {/* Tab 3: Graph Coloring & Discrete Mathematics */}
        {currentTab === 'graph-coloring' && (
          <div className="space-y-6">
            <GraphVisualization
              subjects={subjects}
              conflictEdges={conflictEdges}
              coloringResult={coloringResult}
            />
            <AlgorithmExplainer />
            <ConflictMatrix subjects={subjects} conflictEdges={conflictEdges} />
          </div>
        )}

        {/* Tab 4: Generate Timetable Workflow */}
        {currentTab === 'generator' && (
          <TimetableGenerator
            onViewFinalTimetable={() => {
              setCurrentTab('final-timetable');
              window.location.hash = 'final-timetable';
            }}
          />
        )}

        {/* Tab 5: Final Master Timetable */}
        {currentTab === 'final-timetable' && <FinalTimetableView />}

        {/* Tab 6: Manage Subjects */}
        {currentTab === 'subjects' && <SubjectManager />}

        {/* Tab 7: Manage Classrooms */}
        {currentTab === 'classrooms' && <ClassroomManager />}

        {/* Tab 8: Manage Students */}
        {currentTab === 'students' && <StudentManager />}
      </main>

      {/* Unified Export Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />

      {/* Floating Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl shadow-lg border text-xs flex items-start gap-2.5 transition-all ${
              toast.type === 'success'
                ? 'bg-white border-emerald-300 text-emerald-950'
                : toast.type === 'error'
                ? 'bg-white border-rose-300 text-rose-950'
                : 'bg-white border-blue-300 text-slate-800'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-[#438DFF] shrink-0 mt-0.5" />
            )}
            <div className="flex-1 font-medium">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200 mt-auto py-5 no-print relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0F172A]">ExamForge</span>
            <span>•</span>
            <span>Discrete Mathematics Graph Coloring & Classroom Scheduling System</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Signed in as: <strong className="text-slate-800">{user?.name}</strong></span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">100% Collision-Free</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
