import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Navbar, NavTab } from './components/Navbar';
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
  Sparkles,
  GitGraph,
  Search,
} from 'lucide-react';

export const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);

  const {
    subjects,
    conflictEdges,
    coloringResult,
    scheduledExams,
    toasts,
    removeToast,
  } = useApp();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenExportModal={() => setExportModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Tab 1: Dashboard */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <StatCards
              onNavigateToVacant={() => setCurrentTab('vacant-rooms')}
              onNavigateToGenerator={() => setCurrentTab('generator')}
              onNavigateToGraph={() => setCurrentTab('graph-coloring')}
            />

            {/* College Scenario Explainer */}
            <CollegeScenarioCard
              onFindVacant={() => setCurrentTab('vacant-rooms')}
              onGenerate={() => setCurrentTab('generator')}
              onViewGraph={() => setCurrentTab('graph-coloring')}
            />

            {/* Upcoming Next Exams Preview */}
            <NextExamsPreview
              exams={scheduledExams}
              onViewAll={() => setCurrentTab('final-timetable')}
            />
          </div>
        )}

        {/* Tab 2: Find Vacant Classrooms (KEY SHOWCASE) */}
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
            onViewFinalTimetable={() => setCurrentTab('final-timetable')}
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
      <footer className="bg-white border-t border-slate-200 mt-auto py-5 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0F172A]">ExamForge</span>
            <span>•</span>
            <span>Discrete Mathematics Graph Coloring & Classroom Scheduling System</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Welsh-Powell & DSATUR Algorithms</span>
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
