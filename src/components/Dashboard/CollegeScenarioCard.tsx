import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Calendar,
  Building,
  ArrowRight,
  GitGraph,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CollegeScenarioCard: React.FC<{
  onFindVacant: () => void;
  onGenerate: () => void;
  onViewGraph: () => void;
}> = ({ onFindVacant, onGenerate, onViewGraph }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { coloringResult, conflictEdges, scheduledExams } = useApp();

  const totalSlotsUsed = coloringResult?.totalColorsUsed || 0;

  return (
    <div className="bg-gradient-to-br from-white via-[#FAFBFD] to-[#EAF4FF]/40 rounded-2xl border border-[#438DFF]/20 p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#EAF4FF] text-[#438DFF]">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-[#0F172A]">
              College Examination Scheduling Scenario
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-[#A78BFA]/20 text-[#6D28D9]">
              Discrete Mathematics Showcase
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
            <strong className="text-[#0F172A]">Problem Statement:</strong> "Our college needs to conduct examinations for multiple subjects. Some classrooms may already be occupied, while other classrooms are vacant. ExamForge identifies examination clashes using graph coloring, guarantees conflict-free time slots, and finds suitable vacant classrooms with sufficient seating capacity."
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onGenerate}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#438DFF] hover:bg-[#2563EB] rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Timetable</span>
          </button>
          <button
            onClick={onFindVacant}
            className="px-4 py-2 text-xs font-semibold text-[#0F172A] bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Building className="w-4 h-4 text-[#438DFF]" />
            <span>Find Vacant Classrooms</span>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
            title="Toggle Detailed Questions & Answers"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-6 pt-5 border-t border-slate-200/80">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Key Questions Answered by ExamForge for Professors & Evaluators:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* Q1 & Q2: Clashes and simultaneous exams */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-[#0F172A]">
                <GitGraph className="w-4 h-4 text-[#A78BFA]" />
                <span>1. Which exams can happen together?</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Examinations having <strong className="text-emerald-700">no shared students</strong> form independent sets in the conflict graph $G=(V,E)$ and can be safely held at the exact same time slot in different rooms.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-[#0F172A]">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                <span>2. Which exams MUST be separated?</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                If at least 1 student is enrolled in both examinations, an <strong className="text-amber-700">edge connects them in $G$</strong>. Graph coloring assigns them different colors (distinct time slots).
              </p>
            </div>

            {/* Q3 & Q4: Vacant rooms & capacity */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-[#0F172A]">
                <Building className="w-4 h-4 text-[#438DFF]" />
                <span>3. Which rooms are vacant in a slot?</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                The <strong>Vacant Classroom Finder</strong> checks every room against booked exams using half-open interval overlap $[S_1, E_1) \cap [S_2, E_2)$ to guarantee zero double bookings.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-[#0F172A]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>4. Does room capacity match students?</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                A room is marked <strong>Suitable</strong> only if Room Capacity &ge; Students. If a class exceeds single room capacity, multi-room partitioning is seamlessly applied.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-[#0F172A]">
                <Calendar className="w-4 h-4 text-[#438DFF]" />
                <span>5. What is the final timetable?</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {scheduledExams.length > 0 ? (
                  <span>
                    Successfully scheduled <strong className="text-[#0F172A]">{scheduledExams.length} examinations</strong> into <strong className="text-[#438DFF]">{totalSlotsUsed} distinct time slots</strong> with full room allocations.
                  </span>
                ) : (
                  <span>Click "Generate Timetable" to produce the complete conflict-free schedule.</span>
                )}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-[#0F172A]">
                <Sparkles className="w-4 h-4 text-[#A78BFA]" />
                <span>6. Why was a slot assigned?</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click <strong>"Graph Coloring"</strong> to view the interactive algorithm trace step by step, showing exactly which conflicting neighbor forced an exam into its specific slot!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
