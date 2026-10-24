import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  DoorOpen,
  DoorClosed,
  CheckCircle2,
  AlertTriangle,
  X,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Classroom } from '../../types';

export const ClassroomManager: React.FC = () => {
  const { classrooms, scheduledExams, addClassroom, updateClassroom, deleteClassroom, showToast } =
    useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Partial<Classroom>>({});

  // Filtered classrooms
  const filteredRooms = useMemo(() => {
    return classrooms.filter(
      (r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.building.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [classrooms, searchQuery]);

  const handleOpenCreate = () => {
    setCurrentRoom({
      name: '',
      building: 'Main Academic Block',
      floor: 1,
      capacity: 40,
      isActive: true,
      isLab: false,
    });
    setModalMode('create');
  };

  const handleOpenEdit = (room: Classroom) => {
    setCurrentRoom({ ...room });
    setModalMode('edit');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRoom.name?.trim()) {
      showToast('Classroom name / number is required', 'error');
      return;
    }

    if (modalMode === 'create') {
      addClassroom({
        name: currentRoom.name.trim(),
        building: currentRoom.building || 'Main Academic Block',
        floor: Number(currentRoom.floor) || 1,
        capacity: Number(currentRoom.capacity) || 30,
        isActive: currentRoom.isActive ?? true,
        isLab: currentRoom.isLab ?? false,
      });
    } else if (modalMode === 'edit' && currentRoom.id) {
      updateClassroom(currentRoom.id, {
        name: currentRoom.name.trim(),
        building: currentRoom.building,
        floor: Number(currentRoom.floor),
        capacity: Number(currentRoom.capacity),
        isActive: currentRoom.isActive,
        isLab: currentRoom.isLab,
      });
    }

    setModalMode(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#EAF4FF] text-[#438DFF]">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
                Manage Classrooms & Examination Venues
              </h1>
              <p className="text-xs text-slate-500">
                Configure seating capacities, active statuses, and building locations for scheduling
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#438DFF] hover:bg-[#2563EB] rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Classroom</span>
        </button>
      </div>

      {/* Search & Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Capacity</span>
            <div className="text-xl font-extrabold text-[#0F172A]">
              {classrooms.reduce((acc, r) => acc + (r.isActive ? r.capacity : 0), 0)}{' '}
              <span className="text-xs font-normal text-slate-500">active seats</span>
            </div>
          </div>
          <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <DoorOpen className="w-5 h-5" />
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Active Venues</span>
            <div className="text-xl font-extrabold text-[#0F172A]">
              {classrooms.filter((r) => r.isActive).length} / {classrooms.length}
            </div>
          </div>
          <span className="p-2.5 rounded-xl bg-[#EAF4FF] text-[#438DFF]">
            <CheckCircle2 className="w-5 h-5" />
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Maintenance / Inactive</span>
            <div className="text-xl font-extrabold text-amber-600">
              {classrooms.filter((r) => !r.isActive).length} venues
            </div>
          </div>
          <span className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search classroom name or building..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#438DFF]/30 focus:border-[#438DFF]"
          />
        </div>
      </div>

      {/* Classrooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map((room) => {
          const assignedExamsCount = scheduledExams.filter((e) =>
            e.assignedRoomIds.includes(room.id)
          ).length;

          return (
            <div
              key={room.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between ${
                room.isActive ? 'border-slate-200/80' : 'border-amber-200 bg-amber-50/15'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#438DFF]" />
                    <h3 className="font-extrabold text-base text-[#0F172A]">{room.name}</h3>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      room.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    {room.isActive ? 'Active' : 'Maintenance'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-3">
                  {room.building} • Floor {room.floor}
                  {room.isLab && ' • Computer Lab'}
                </p>

                <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-slate-50 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                      Seating Capacity
                    </span>
                    <span className="text-base font-extrabold text-[#0F172A]">
                      {room.capacity} seats
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                      Scheduled Exams
                    </span>
                    <span className="text-base font-extrabold text-[#438DFF]">
                      {assignedExamsCount}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-2">
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  <span>
                    Slot availability is calculated dynamically on the{' '}
                    <strong className="text-[#438DFF]">Vacant Classrooms</strong> page.
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    updateClassroom(room.id, { isActive: !room.isActive })
                  }
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition ${
                    room.isActive
                      ? 'text-amber-700 hover:bg-amber-50'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  {room.isActive ? 'Mark Inactive' : 'Activate Room'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(room)}
                    className="p-1.5 text-slate-500 hover:text-[#438DFF] hover:bg-slate-100 rounded-lg transition"
                    title="Edit Classroom"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete classroom ${room.name}?`)) {
                        deleteClassroom(room.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Classroom"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Classroom Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#0F172A]">
                {modalMode === 'create' ? 'Add New Classroom Venue' : `Edit ${currentRoom.name}`}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Room Name / Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lecture Hall 201"
                  value={currentRoom.name || ''}
                  onChange={(e) => setCurrentRoom({ ...currentRoom, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Seating Capacity *</label>
                  <input
                    type="number"
                    min={5}
                    max={500}
                    required
                    value={currentRoom.capacity || 40}
                    onChange={(e) =>
                      setCurrentRoom({ ...currentRoom, capacity: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Floor Level</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={currentRoom.floor || 1}
                    onChange={(e) =>
                      setCurrentRoom({ ...currentRoom, floor: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Building Block</label>
                <input
                  type="text"
                  placeholder="e.g. Block C (Tech Tower)"
                  value={currentRoom.building || ''}
                  onChange={(e) => setCurrentRoom({ ...currentRoom, building: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentRoom.isActive ?? true}
                    onChange={(e) => setCurrentRoom({ ...currentRoom, isActive: e.target.checked })}
                    className="accent-[#438DFF]"
                  />
                  <span className="font-semibold text-slate-700">Room is Active for Scheduling</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentRoom.isLab ?? false}
                    onChange={(e) => setCurrentRoom({ ...currentRoom, isLab: e.target.checked })}
                    className="accent-[#438DFF]"
                  />
                  <span className="font-medium text-slate-600">Computer / Technical Lab</span>
                </label>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#438DFF] hover:bg-[#2563EB] rounded-xl shadow-xs transition"
                >
                  {modalMode === 'create' ? 'Add Classroom' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
