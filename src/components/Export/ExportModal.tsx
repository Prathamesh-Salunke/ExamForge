import React from 'react';
import {
  Download,
  X,
  FileSpreadsheet,
  Table,
  Building,
  AlertTriangle,
  DoorOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  exportTimetable,
  exportClassroomAllocations,
  exportConflictReport,
  exportVacantRoomsReport,
} from '../../utils/exportUtils';
import { findVacantClassrooms } from '../../algorithms/roomAllocator';

export const ExportModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const {
    scheduledExams,
    classrooms,
    subjects,
    students,
    conflictEdges,
    timetableMetadata,
    showToast,
  } = useApp();

  if (!isOpen) return null;

  const handleExportTimetable = (format: 'xlsx' | 'csv') => {
    exportTimetable(scheduledExams, timetableMetadata.semesterName, format);
    showToast(`Master Timetable downloaded (${format.toUpperCase()})`, 'success');
  };

  const handleExportRooms = (format: 'xlsx' | 'csv') => {
    exportClassroomAllocations(classrooms, scheduledExams, format);
    showToast(`Classroom Allocation matrix downloaded (${format.toUpperCase()})`, 'success');
  };

  const handleExportConflicts = (format: 'xlsx' | 'csv') => {
    exportConflictReport(conflictEdges, subjects, students, format);
    showToast(`Conflict Analysis report downloaded (${format.toUpperCase()})`, 'success');
  };

  const handleExportSampleVacant = (format: 'xlsx' | 'csv') => {
    const statuses = findVacantClassrooms(classrooms, scheduledExams, '2026-05-11', '09:30', '12:30', 35);
    exportVacantRoomsReport(statuses, '2026-05-11', '09:30', '12:30', 35, format);
    showToast(`Vacant Classrooms report downloaded (${format.toUpperCase()})`, 'success');
  };

  const exportOptions = [
    {
      title: 'Master Examination Timetable',
      description: 'Complete scheduled examination list with dates, hours, assigned rooms, and time slots.',
      icon: <Table className="w-5 h-5 text-[#438DFF]" />,
      action: handleExportTimetable,
      count: `${scheduledExams.length} examinations`,
    },
    {
      title: 'Classroom Allocation Matrix',
      description: 'Every classroom venue with capacity, active state, and assigned examinations.',
      icon: <Building className="w-5 h-5 text-indigo-500" />,
      action: handleExportRooms,
      count: `${classrooms.length} venues`,
    },
    {
      title: 'Student Conflict Report G = (V,E)',
      description: 'Discrete mathematics conflict pairs, shared student rosters, and scheduling constraints.',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      action: handleExportConflicts,
      count: `${conflictEdges.length} conflict edges`,
    },
    {
      title: 'Vacant Classroom Status Report',
      description: 'Audit report showing vacant vs. occupied venues, capacity sufficiency, and remaining seats.',
      icon: <DoorOpen className="w-5 h-5 text-emerald-600" />,
      action: handleExportSampleVacant,
      count: 'Live Query State',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A]">
                Export Authentic College Reports
              </h3>
              <p className="text-xs text-slate-500">
                Generate real Excel (.xlsx) and CSV files populated with active application data
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 my-4">
          {exportOptions.map((opt, i) => (
            <div
              key={i}
              className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs shrink-0 mt-0.5">
                  {opt.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[#0F172A]">{opt.title}</h4>
                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-white text-slate-600 border border-slate-200">
                      {opt.count}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{opt.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => opt.action('xlsx')}
                  className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition flex items-center gap-1"
                  title="Download Microsoft Excel file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={() => opt.action('csv')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-200 border border-slate-200 rounded-lg transition"
                  title="Download Comma Separated Values file"
                >
                  CSV
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
