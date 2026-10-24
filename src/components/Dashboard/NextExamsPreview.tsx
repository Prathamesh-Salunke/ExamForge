import React from 'react';
import { ScheduledExam } from '../../types';
import { Calendar, Clock, MapPin, Users, CheckCircle2, ArrowRight } from 'lucide-react';

export const NextExamsPreview: React.FC<{
  exams: ScheduledExam[];
  onViewAll: () => void;
}> = ({ exams, onViewAll }) => {
  // Take first 5 upcoming exams sorted by date then start time
  const previewExams = [...exams]
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))
    .slice(0, 5);

  if (previewExams.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center shadow-xs">
        <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-700">No Examinations Scheduled Yet</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Click "Generate Timetable" to trigger graph coloring and automatic classroom allocations.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-white/80 p-6 shadow-md shadow-[#438DFF]/5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">Upcoming Examinations Preview</h3>
          <p className="text-xs text-slate-500">First chronological examinations in the master schedule</p>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-[#438DFF] hover:text-[#2563EB] flex items-center gap-1 group"
        >
          <span>View Master Timetable</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="pb-2.5">Date & Slot</th>
              <th className="pb-2.5">Subject</th>
              <th className="pb-2.5">Allocated Rooms</th>
              <th className="pb-2.5 text-center">Students / Capacity</th>
              <th className="pb-2.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {previewExams.map((exam) => (
              <tr key={exam.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 font-medium text-slate-900 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: exam.colorHex }}
                    />
                    <div>
                      <div className="font-semibold text-slate-800">{exam.date}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{exam.startTime} - {exam.endTime}</span>
                        <span className="text-slate-300">|</span>
                        <span className="font-medium text-[#438DFF]">Slot {exam.timeSlotIndex + 1}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <div className="font-bold text-[#0F172A]">{exam.subjectCode}</div>
                  <div className="text-slate-500 text-[11px] line-clamp-1">{exam.subjectName}</div>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#438DFF]" />
                    <span>{exam.assignedRoomNames.join(', ') || 'Unallocated'}</span>
                  </div>
                </td>
                <td className="py-3 text-center whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 font-semibold text-slate-700">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span>{exam.totalStudents} / {exam.totalCapacityProvided}</span>
                  </span>
                </td>
                <td className="py-3 text-right whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Ready
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
