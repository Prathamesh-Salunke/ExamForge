import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  Download,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Grid,
  List,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScheduledExam } from '../../types';
import { exportTimetable, exportClassroomAllocations } from '../../utils/exportUtils';

export const FinalTimetableView: React.FC = () => {
  const {
    scheduledExams,
    classrooms,
    subjects,
    timetableMetadata,
    updateScheduledExam,
    validationReport,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('all');
  const [viewLayout, setViewLayout] = useState<'table' | 'grid'>('table');
  const [editingExam, setEditingExam] = useState<ScheduledExam | null>(null);

  // Unique dates and rooms for filters
  const uniqueDates = useMemo(() => {
    return Array.from(new Set(scheduledExams.map((e) => e.date))).sort();
  }, [scheduledExams]);

  const uniqueRooms = useMemo(() => {
    return classrooms.map((r) => r.name).sort();
  }, [classrooms]);

  // Filtered exams
  const filteredExams = useMemo(() => {
    return scheduledExams.filter((exam) => {
      const matchesSearch =
        exam.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.assignedRoomNames.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDate =
        selectedDateFilter === 'all' || exam.date === selectedDateFilter;

      const matchesRoom =
        selectedRoomFilter === 'all' ||
        exam.assignedRoomNames.includes(selectedRoomFilter);

      return matchesSearch && matchesDate && matchesRoom;
    });
  }, [scheduledExams, searchQuery, selectedDateFilter, selectedRoomFilter]);

  // Handle Manual Edit Save
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam) return;

    // Recalculate capacity based on assigned rooms
    const assignedRooms = classrooms.filter((r) => editingExam.assignedRoomIds.includes(r.id));
    const totalCap = assignedRooms.reduce((acc, r) => acc + r.capacity, 0);

    updateScheduledExam(editingExam.id, {
      ...editingExam,
      assignedRoomNames: assignedRooms.map((r) => r.name),
      totalCapacityProvided: totalCap,
    });

    setEditingExam(null);
    showToast(`Updated examination ${editingExam.subjectCode}. Schedule re-validated!`, 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header and Print/Export Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#EAF4FF] text-[#438DFF]">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
                Final Master Examination Timetable
              </h1>
              <p className="text-xs text-slate-500">
                Official schedule for {timetableMetadata.semesterName} • {scheduledExams.length} Examinations
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 no-print">
          <button
            onClick={() => exportTimetable(scheduledExams, timetableMetadata.semesterName, 'xlsx')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Excel Export</span>
          </button>
          <button
            onClick={() => exportTimetable(scheduledExams, timetableMetadata.semesterName, 'csv')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <span>CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#438DFF] hover:bg-[#2563EB] rounded-xl shadow-xs transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Timetable</span>
          </button>
        </div>
      </div>

      {/* Validation Status Notification */}
      {!validationReport.isValid && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-900 flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>
              <strong>Validation Alert:</strong> {validationReport.errorCount} collision(s) detected in the timetable! Check generator report.
            </span>
          </div>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs no-print flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search code, subject, room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#438DFF]/30 focus:border-[#438DFF]"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Date Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-semibold">Date:</span>
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-xl bg-white"
            >
              <option value="all">All Dates ({uniqueDates.length})</option>
              {uniqueDates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Room Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-semibold">Classroom:</span>
            <select
              value={selectedRoomFilter}
              onChange={(e) => setSelectedRoomFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-xl bg-white"
            >
              <option value="all">All Classrooms ({uniqueRooms.length})</option>
              {uniqueRooms.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Layout Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200 ml-auto md:ml-2">
            <button
              onClick={() => setViewLayout('table')}
              className={`p-1.5 rounded-lg transition ${
                viewLayout === 'table' ? 'bg-white text-[#438DFF] shadow-xs' : 'text-slate-500'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewLayout('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewLayout === 'grid' ? 'bg-white text-[#438DFF] shadow-xs' : 'text-slate-500'
              }`}
              title="Card Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main View: Table Layout */}
      {viewLayout === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date & Time Slot</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Allocated Classrooms</th>
                  <th className="py-3 px-4 text-center">Registered Students</th>
                  <th className="py-3 px-4 text-center">Room Capacity</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExams.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No examinations match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredExams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: exam.colorHex }}
                          />
                          <div>
                            <div className="font-bold text-slate-900">{exam.date}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{exam.startTime} - {exam.endTime}</span>
                              <span className="text-slate-300">|</span>
                              <span className="font-semibold text-[#438DFF]">
                                Slot {exam.timeSlotIndex + 1}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-[#0F172A]">{exam.subjectCode}</div>
                        <div className="text-slate-600 font-medium">{exam.subjectName}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <MapPin className="w-3.5 h-3.5 text-[#438DFF] shrink-0" />
                          <span>{exam.assignedRoomNames.join(', ') || 'None Allocated'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {exam.totalStudents}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`font-bold ${
                            exam.totalCapacityProvided >= exam.totalStudents
                              ? 'text-emerald-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {exam.totalCapacityProvided} seats
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Validated
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right no-print whitespace-nowrap">
                        <button
                          onClick={() => setEditingExam(exam)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#438DFF] px-2.5 py-1 rounded-lg hover:bg-slate-100 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: exam.colorHex }}
                    />
                    <span className="text-xs font-bold text-[#438DFF] bg-[#EAF4FF] px-2 py-0.5 rounded-full">
                      Slot {exam.timeSlotIndex + 1}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Validated
                  </span>
                </div>

                <h4 className="text-base font-extrabold text-[#0F172A] mt-1">{exam.subjectCode}</h4>
                <p className="text-xs text-slate-600 font-medium mb-3">{exam.subjectName}</p>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-800">{exam.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exam.startTime} - {exam.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#438DFF]" />
                    <span className="font-semibold text-slate-800">
                      {exam.assignedRoomNames.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exam.totalStudents} students / {exam.totalCapacityProvided} seats</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end no-print">
                <button
                  onClick={() => setEditingExam(exam)}
                  className="text-xs font-semibold text-[#438DFF] hover:underline flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Manual Reschedule</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manual Exam Edit Dialog Modal */}
      {editingExam && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-[#0F172A] mb-1">
              Manual Reschedule: {editingExam.subjectCode}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Override scheduled room, date, or time. System will automatically re-verify constraints.
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Examination Date</label>
                <input
                  type="date"
                  value={editingExam.date}
                  onChange={(e) => setEditingExam({ ...editingExam, date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={editingExam.startTime}
                    onChange={(e) => setEditingExam({ ...editingExam, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={editingExam.endTime}
                    onChange={(e) => setEditingExam({ ...editingExam, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Assigned Classrooms (Select one or more)
                </label>
                <div className="max-h-40 overflow-y-auto space-y-1.5 border border-slate-200 p-2 rounded-xl">
                  {classrooms.map((room) => {
                    const isChecked = editingExam.assignedRoomIds.includes(room.id);
                    return (
                      <label
                        key={room.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                          isChecked ? 'bg-[#EAF4FF] text-[#438DFF] font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const newIds = e.target.checked
                                ? [...editingExam.assignedRoomIds, room.id]
                                : editingExam.assignedRoomIds.filter((id) => id !== room.id);
                              setEditingExam({ ...editingExam, assignedRoomIds: newIds });
                            }}
                            className="accent-[#438DFF]"
                          />
                          <span>{room.name}</span>
                        </div>
                        <span className="text-slate-500 font-mono text-[11px]">
                          {room.capacity} seats
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingExam(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#438DFF] hover:bg-[#2563EB] rounded-xl shadow-xs transition"
                >
                  Save & Validate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
