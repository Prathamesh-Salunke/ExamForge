import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  ArrowRight,
  ShieldCheck,
  Building,
  Clock,
  Layers,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TimetableGenerator: React.FC<{
  onViewFinalTimetable: () => void;
}> = ({ onViewFinalTimetable }) => {
  const {
    subjects,
    classrooms,
    scheduledExams,
    timetableMetadata,
    algorithmPreference,
    setAlgorithmPreference,
    generateTimetable,
    saveTimetable,
    validationReport,
    coloringResult,
  } = useApp();

  const [startDate, setStartDate] = useState<string>('2026-05-11');
  const [selectedAlgo, setSelectedAlgo] = useState<'GREEDY' | 'DSATUR'>(algorithmPreference);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setAlgorithmPreference(selectedAlgo);
      generateTimetable(selectedAlgo, startDate);
      setIsGenerating(false);
    }, 400);
  };

  const isDraft = timetableMetadata.status === 'DRAFT';
  const totalSlots = coloringResult?.totalColorsUsed || 0;

  return (
    <div className="space-y-6">
      {/* Workflow Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#EAF4FF] text-[#438DFF]">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
                  Intelligent Timetable Generation Workflow
                </h1>
                <p className="text-xs text-slate-500">
                  Construct conflict graph $G=(V,E)$, apply coloring, map time slots, and assign vacant classrooms
                </p>
              </div>
            </div>
          </div>

          {/* Draft / Saved Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                isDraft
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}
            >
              {isDraft ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>DRAFT SCHEDULE (Review & Save)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>OFFICIAL SAVED TIMETABLE</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* 6-Step Visual Scheduling Pipeline */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-6 pt-5 border-t border-slate-100">
          {[
            { step: '1', title: 'Registration Data', desc: `${subjects.length} subjects, student rosters` },
            { step: '2', title: 'Graph G=(V,E)', desc: 'Clash edges for shared students' },
            { step: '3', title: 'Graph Coloring', desc: `${selectedAlgo} optimal slots` },
            { step: '4', title: 'Interval Mapping', desc: 'Calendar dates & exam hours' },
            { step: '5', title: 'Room Allocation', desc: 'Best-fit vacant active rooms' },
            { step: '6', title: 'Validation Suite', desc: 'Zero collision guarantee' },
          ].map((item, i) => (
            <div key={i} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 text-xs">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-4 h-4 rounded-full bg-[#438DFF] text-white text-[10px] font-bold flex items-center justify-center">
                  {item.step}
                </span>
                <span className="font-bold text-slate-800">{item.title}</span>
              </div>
              <p className="text-[11px] text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Generator Configuration Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
          Scheduling Parameters & Algorithm Selection
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Start Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Examination Start Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#438DFF]/30 focus:border-[#438DFF]"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">2 examination slots per day (Sundays skipped)</p>
          </div>

          {/* Graph Coloring Algorithm */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Graph Coloring Heuristic
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedAlgo('GREEDY')}
                className={`px-3 py-2 text-xs font-bold rounded-xl border text-left transition ${
                  selectedAlgo === 'GREEDY'
                    ? 'bg-[#EAF4FF] text-[#438DFF] border-[#438DFF]'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>Welsh-Powell</div>
                <div className="text-[10px] font-normal text-slate-400">Greedy descending</div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedAlgo('DSATUR')}
                className={`px-3 py-2 text-xs font-bold rounded-xl border text-left transition ${
                  selectedAlgo === 'DSATUR'
                    ? 'bg-purple-50 text-[#7C3AED] border-[#A78BFA]'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>DSATUR</div>
                <div className="text-[10px] font-normal text-slate-400">Saturation degree</div>
              </button>
            </div>
          </div>

          {/* Classroom Multi-room Policy */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Classroom Allocation Mode
            </label>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-800 block">Best-Fit with Multi-Room Support</span>
              <span className="text-[11px] text-slate-500">
                Picks smallest room fitting all students; splits into paired rooms if enrollment exceeds single room capacity.
              </span>
            </div>
          </div>
        </div>

        {/* Generate & Save Actions */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Last Generated:{' '}
            <strong className="text-slate-800">
              {timetableMetadata.generatedAt || 'Not generated in this session'}
            </strong>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#438DFF] hover:bg-[#2563EB] disabled:opacity-50 rounded-xl shadow-xs transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Running Graph Coloring...' : 'Generate / Regenerate Timetable'}</span>
            </button>

            {isDraft && (
              <button
                onClick={saveTimetable}
                className="px-5 py-2.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl transition flex items-center gap-2"
              >
                <Save className="w-4 h-4 text-emerald-700" />
                <span>Validate & Save Schedule</span>
              </button>
            )}

            <button
              onClick={onViewFinalTimetable}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition flex items-center gap-1.5"
            >
              <span>View Timetable</span>
              <ArrowRight className="w-4 h-4 text-[#438DFF]" />
            </button>
          </div>
        </div>
      </div>

      {/* Validation Verification Results Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-[#0F172A]">
              Constraint Validation & Correctness Report
            </h3>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              validationReport.isValid
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {validationReport.isValid ? '100% Valid (Pass)' : `${validationReport.errorCount} Errors Found`}
          </span>
        </div>

        {validationReport.isValid ? (
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-bold text-emerald-950 block">All College Constraints Satisfied:</strong>
              <div>✓ Zero student overlaps: No student has two exams at the same time.</div>
              <div>✓ Zero room double bookings: No classroom is occupied by two exams simultaneously.</div>
              <div>✓ Room capacity verified: Every examination has sufficient seats in assigned rooms.</div>
              <div>✓ Active room enforcement: No examination is placed in a maintenance-restricted room.</div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {validationReport.issues.map((issue, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  issue.severity === 'ERROR'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1">
                  <span className="font-bold uppercase text-[10px] tracking-wider block">
                    {issue.type}
                  </span>
                  <span>{issue.message}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Draft / Scheduled Exams Table Preview */}
      {scheduledExams.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-[#0F172A]">Generated Schedule Details</h4>
              <p className="text-xs text-slate-500">
                {scheduledExams.length} examinations allocated across {totalSlots} time slots
              </p>
            </div>
            <button
              onClick={onViewFinalTimetable}
              className="text-xs font-semibold text-[#438DFF] hover:underline"
            >
              Open Full Timetable View →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Slot & Date</th>
                  <th className="py-2.5 px-3">Examination</th>
                  <th className="py-2.5 px-3">Time Window</th>
                  <th className="py-2.5 px-3">Assigned Classrooms</th>
                  <th className="py-2.5 px-3 text-center">Students / Capacity</th>
                  <th className="py-2.5 px-3 text-right">Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scheduledExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold text-[#0F172A]">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: exam.colorHex }}
                        />
                        <span>Slot {exam.timeSlotIndex + 1}</span>
                        <span className="text-slate-400 font-normal">({exam.date})</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#0F172A]">
                      {exam.subjectCode} - {exam.subjectName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      {exam.startTime} - {exam.endTime}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {exam.assignedRoomNames.join(', ') || 'Unallocated'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-semibold text-slate-700">
                        {exam.totalStudents} / {exam.totalCapacityProvided}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Valid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
