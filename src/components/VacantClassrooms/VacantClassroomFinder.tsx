import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  Users,
  Download,
  Info,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { findVacantClassrooms, doIntervalsOverlap } from '../../algorithms/roomAllocator';
import { exportVacantRoomsReport } from '../../utils/exportUtils';

export const VacantClassroomFinder: React.FC = () => {
  const { classrooms, scheduledExams, showToast } = useApp();

  // Query states
  const [targetDate, setTargetDate] = useState<string>('2026-05-11');
  const [startTime, setStartTime] = useState<string>('09:30');
  const [durationMinutes, setDurationMinutes] = useState<number>(180);
  const [requiredStudents, setRequiredStudents] = useState<number>(35);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [filterType, setFilterType] = useState<'all' | 'suitable' | 'available' | 'occupied'>('all');
  const [showOverlapExplainer, setShowOverlapExplainer] = useState<boolean>(true);

  // Compute End Time based on Start Time + Duration
  const endTime = useMemo(() => {
    const [h, m] = startTime.split(':').map(Number);
    const totalMin = (h || 0) * 60 + (m || 0) + durationMinutes;
    const endH = Math.floor(totalMin / 60) % 24;
    const endM = totalMin % 60;
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
  }, [startTime, durationMinutes]);

  // Evaluate vacancy statuses
  const vacancyResults = useMemo(() => {
    return findVacantClassrooms(
      classrooms,
      scheduledExams,
      targetDate,
      startTime,
      endTime,
      requiredStudents
    );
  }, [classrooms, scheduledExams, targetDate, startTime, endTime, requiredStudents]);

  // Counts
  const suitableCount = vacancyResults.filter((r) => r.isSuitable).length;
  const availableCount = vacancyResults.filter((r) => r.isAvailable).length;
  const occupiedCount = vacancyResults.filter((r) => !r.isAvailable).length;

  // Filtered list
  const filteredResults = useMemo(() => {
    if (filterType === 'suitable') return vacancyResults.filter((r) => r.isSuitable);
    if (filterType === 'available') return vacancyResults.filter((r) => r.isAvailable);
    if (filterType === 'occupied') return vacancyResults.filter((r) => !r.isAvailable);
    return vacancyResults;
  }, [vacancyResults, filterType]);

  // Multi-room combiner helper: if required students exceed any single room
  const combinedRoomSolution = useMemo(() => {
    const availableRooms = vacancyResults
      .filter((r) => r.isAvailable && r.classroom.isActive)
      .map((r) => r.classroom)
      .sort((a, b) => b.capacity - a.capacity);

    if (availableRooms.some((r) => r.capacity >= requiredStudents)) {
      return null; // Single room is already sufficient!
    }

    let combinedCap = 0;
    const selected: typeof availableRooms = [];
    for (const room of availableRooms) {
      selected.push(room);
      combinedCap += room.capacity;
      if (combinedCap >= requiredStudents) {
        return {
          rooms: selected,
          totalCapacity: combinedCap,
        };
      }
    }
    return null;
  }, [vacancyResults, requiredStudents]);

  // Export Vacant Rooms report
  const handleExport = (format: 'xlsx' | 'csv') => {
    exportVacantRoomsReport(
      vacancyResults,
      targetDate,
      startTime,
      endTime,
      requiredStudents,
      format
    );
    showToast(`Exported Vacant Classrooms report as ${format.toUpperCase()}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#EAF4FF] text-[#438DFF]">
              <Search className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
                Find Vacant Classrooms
              </h1>
              <p className="text-xs text-slate-500">
                Identify available rooms for any date, time interval, and seating capacity constraint
              </p>
            </div>
          </div>
        </div>

        {/* Export & Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('xlsx')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Query Parameters Filter Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#438DFF]" />
          <span>Classroom Search Parameters</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Examination Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#438DFF]/30 focus:border-[#438DFF]"
              />
            </div>
          </div>

          {/* 2. Start Time */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Start Time
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#438DFF]/30 focus:border-[#438DFF]"
                />
              </div>
              <button
                type="button"
                onClick={() => setStartTime('09:30')}
                className={`px-2 py-2 text-[11px] font-semibold rounded-lg border ${
                  startTime === '09:30'
                    ? 'bg-[#EAF4FF] text-[#438DFF] border-[#438DFF]/40'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
                title="Morning Session Preset"
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setStartTime('13:30')}
                className={`px-2 py-2 text-[11px] font-semibold rounded-lg border ${
                  startTime === '13:30'
                    ? 'bg-[#EAF4FF] text-[#438DFF] border-[#438DFF]/40'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
                title="Afternoon Session Preset"
              >
                PM
              </button>
            </div>
          </div>

          {/* 3. Duration & Calculated End Time */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Duration & Interval
            </label>
            <div className="flex items-center gap-2">
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#438DFF]/30 focus:border-[#438DFF] bg-white"
              >
                <option value={60}>60 mins (1 hr)</option>
                <option value={90}>90 mins (1.5 hrs)</option>
                <option value={120}>120 mins (2 hrs)</option>
                <option value={180}>180 mins (3 hrs)</option>
                <option value={240}>240 mins (4 hrs)</option>
              </select>
              <div className="px-2.5 py-2 text-[11px] font-mono font-bold bg-slate-100 text-slate-700 rounded-xl whitespace-nowrap">
                → {endTime}
              </div>
            </div>
          </div>

          {/* 4. Required Seating Capacity */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Required Student Seating
              </label>
              <span className="text-xs font-bold text-[#438DFF]">{requiredStudents} seats</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={1}
                max={100}
                value={requiredStudents}
                onChange={(e) => setRequiredStudents(Number(e.target.value))}
                className="w-full accent-[#438DFF] cursor-pointer"
              />
              <input
                type="number"
                min={1}
                max={200}
                value={requiredStudents}
                onChange={(e) => setRequiredStudents(Number(e.target.value))}
                className="w-16 px-2 py-1 text-xs text-center font-bold border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Quick summary metrics */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Query Target:</span>
            <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
              {targetDate} | {startTime} - {endTime} ({durationMinutes} mins) | Need {requiredStudents} seats
            </span>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filterType === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({classrooms.length})
            </button>
            <button
              onClick={() => setFilterType('suitable')}
              className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                filterType === 'suitable'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Suitable ({suitableCount})</span>
            </button>
            <button
              onClick={() => setFilterType('available')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filterType === 'available'
                  ? 'bg-[#438DFF] text-white'
                  : 'bg-[#EAF4FF] text-[#438DFF] hover:bg-[#D9EBFF]'
              }`}
            >
              Vacant ({availableCount})
            </button>
            <button
              onClick={() => setFilterType('occupied')}
              className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                filterType === 'occupied'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Occupied ({occupiedCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interval Overlap Math Explainer Card */}
      {showOverlapExplainer && (
        <div className="bg-[#EAF4FF]/50 border border-[#438DFF]/20 rounded-2xl p-4 sm:p-5 text-xs text-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white text-[#438DFF] border border-[#438DFF]/20 shadow-xs shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <strong className="font-bold text-[#0F172A] block mb-0.5">
                Mathematical Overlap Rule Demonstration (Half-Open Interval Check)
              </strong>
              <p className="text-slate-600 leading-relaxed">
                ExamForge checks interval collision using half-open intervals: [S_req, E_req) and [S_exist, E_exist) overlap if and only if S_req &lt; E_exist and E_req &gt; S_exist. For instance, a room occupied from <strong>10:00 to 12:00</strong> is strictly flagged <span className="text-rose-600 font-bold">UNAVAILABLE</span> for a requested window of <strong>11:30 to 12:30</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowOverlapExplainer(false)}
            className="text-slate-400 hover:text-slate-600 font-semibold self-end md:self-center shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Multi-Room Combination Notice if required students > any single room */}
      {combinedRoomSolution && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-center gap-3">
          <Layers className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <strong className="font-bold">Multi-Room Solution Available:</strong> No single vacant room has {requiredStudents} seats, but you can seat all students by combining{' '}
            <strong>
              {combinedRoomSolution.rooms.map((r) => `${r.name} (${r.capacity} seats)`).join(' + ')}
            </strong>{' '}
            for a total of {combinedRoomSolution.totalCapacity} seats!
          </div>
        </div>
      )}

      {/* Results View Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#0F172A]">
          Classroom Allocation Status ({filteredResults.length} rooms)
        </h3>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
              viewMode === 'cards' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-slate-500'
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
              viewMode === 'table' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-slate-500'
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResults.map((item) => {
            const { classroom, isAvailable, isSuitable, isCapacitySufficient, remainingSeats, conflictingExam, unsuitabilityReason } = item;

            return (
              <div
                key={classroom.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between ${
                  isSuitable
                    ? 'border-emerald-300 ring-2 ring-emerald-500/10'
                    : !isAvailable
                    ? 'border-rose-200 bg-rose-50/20'
                    : 'border-amber-200 bg-amber-50/10'
                }`}
              >
                <div>
                  {/* Top Bar with Name & Status Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2
                          className={`w-4 h-4 ${
                            isSuitable
                              ? 'text-emerald-600'
                              : !isAvailable
                              ? 'text-rose-500'
                              : 'text-amber-500'
                          }`}
                        />
                        <h4 className="text-base font-bold text-[#0F172A]">{classroom.name}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {classroom.building} • Floor {classroom.floor}
                        {classroom.isLab && ' • (Computing Lab)'}
                      </p>
                    </div>

                    {isSuitable ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full whitespace-nowrap">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Suitable & Vacant
                      </span>
                    ) : !isAvailable ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100 border border-rose-300 px-2.5 py-1 rounded-full whitespace-nowrap">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        Occupied
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full whitespace-nowrap">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Vacant (Shortfall)
                      </span>
                    )}
                  </div>

                  {/* Seating Details */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-slate-50 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        Room Capacity
                      </span>
                      <span className="text-base font-extrabold text-[#0F172A]">
                        {classroom.capacity}{' '}
                        <span className="text-xs font-normal text-slate-500">seats</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                        {isCapacitySufficient ? 'Spare / Free Seats' : 'Capacity Shortfall'}
                      </span>
                      <span
                        className={`text-base font-extrabold ${
                          isCapacitySufficient ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {isCapacitySufficient ? (
                          `+${remainingSeats}`
                        ) : (
                          `-${requiredStudents - classroom.capacity}`
                        )}
                        <span className="text-xs font-normal text-slate-500">
                          {' '}
                          {isCapacitySufficient ? 'spare' : 'short'}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Conflicting Examination or Unsuitability Notice */}
                  {conflictingExam && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 mt-2">
                      <div className="font-bold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Clashing Examination Booked:</span>
                      </div>
                      <div className="mt-1 font-semibold">{conflictingExam.subjectCode} - {conflictingExam.subjectName}</div>
                      <div className="text-[11px] text-rose-700 mt-0.5">
                        Scheduled: {conflictingExam.date} ({conflictingExam.startTime} - {conflictingExam.endTime})
                      </div>
                    </div>
                  )}

                  {!isSuitable && !conflictingExam && unsuitabilityReason && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 mt-2 flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{unsuitabilityReason}</span>
                    </div>
                  )}

                  {isSuitable && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 mt-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Room is completely free for {durationMinutes} mins and easily seats all {requiredStudents} students.
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Room ID: {classroom.id}</span>
                  <span className={classroom.isActive ? 'text-emerald-600 font-semibold' : 'text-slate-400'}>
                    {classroom.isActive ? 'Active Status' : 'Maintenance'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Classroom</th>
                  <th className="py-3 px-4">Building & Floor</th>
                  <th className="py-3 px-4 text-center">Room Capacity</th>
                  <th className="py-3 px-4 text-center">Requested Seats</th>
                  <th className="py-3 px-4 text-center">Spare / Deficit</th>
                  <th className="py-3 px-4">Vacancy & Overlap Status</th>
                  <th className="py-3 px-4">Suitability Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.map((item) => {
                  const { classroom, isAvailable, isSuitable, isCapacitySufficient, remainingSeats, conflictingExam, unsuitabilityReason } = item;

                  return (
                    <tr
                      key={classroom.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isSuitable ? 'bg-emerald-50/10' : !isAvailable ? 'bg-rose-50/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-[#0F172A] whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2
                            className={`w-4 h-4 ${
                              isSuitable
                                ? 'text-emerald-600'
                                : !isAvailable
                                ? 'text-rose-500'
                                : 'text-amber-500'
                            }`}
                          />
                          <span>{classroom.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {classroom.building} (Fl. {classroom.floor})
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {classroom.capacity}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600 font-medium">
                        {requiredStudents}
                      </td>
                      <td className="py-3 px-4 text-center font-bold whitespace-nowrap">
                        {isCapacitySufficient ? (
                          <span className="text-emerald-700">+{remainingSeats} spare</span>
                        ) : (
                          <span className="text-amber-700">-{requiredStudents - classroom.capacity} short</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isAvailable ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Vacant ({startTime}-{endTime})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Occupied Overlap
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs">
                        {isSuitable ? (
                          <span className="text-emerald-700 font-semibold">
                            Suitable for exam ({remainingSeats} extra seats)
                          </span>
                        ) : conflictingExam ? (
                          <span className="text-rose-700">
                            Clashes with {conflictingExam.subjectCode} ({conflictingExam.startTime}-{conflictingExam.endTime})
                          </span>
                        ) : (
                          <span className="text-amber-700">{unsuitabilityReason}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
