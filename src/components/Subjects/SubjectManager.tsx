import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Subject } from '../../types';

export const SubjectManager: React.FC = () => {
  const { subjects, students, addSubject, updateSubject, deleteSubject, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [currentSubject, setCurrentSubject] = useState<Partial<Subject>>({});
  const [enrolledStudentSelectorOpen, setEnrolledStudentSelectorOpen] = useState(false);

  // Departments
  const departments = useMemo(() => {
    return Array.from(new Set(subjects.map((s) => s.department)));
  }, [subjects]);

  // Filtered
  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchSearch =
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = departmentFilter === 'all' || s.department === departmentFilter;
      return matchSearch && matchDept;
    });
  }, [subjects, searchQuery, departmentFilter]);

  const handleOpenCreate = () => {
    setCurrentSubject({
      code: '',
      name: '',
      department: 'Computer Science',
      semester: 4,
      durationMinutes: 180,
      enrolledStudentIds: [],
    });
    setModalMode('create');
  };

  const handleOpenEdit = (sub: Subject) => {
    setCurrentSubject({ ...sub });
    setModalMode('edit');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSubject.code?.trim() || !currentSubject.name?.trim()) {
      showToast('Subject Code and Subject Name are required', 'error');
      return;
    }

    if (modalMode === 'create') {
      // Check duplicate code
      if (subjects.some((s) => s.code.toLowerCase() === currentSubject.code?.trim().toLowerCase())) {
        showToast(`Subject Code "${currentSubject.code}" already exists!`, 'error');
        return;
      }
      addSubject({
        code: currentSubject.code.trim().toUpperCase(),
        name: currentSubject.name.trim(),
        department: currentSubject.department || 'Computer Science',
        semester: Number(currentSubject.semester) || 4,
        durationMinutes: Number(currentSubject.durationMinutes) || 180,
        enrolledStudentIds: currentSubject.enrolledStudentIds || [],
      });
    } else if (modalMode === 'edit' && currentSubject.id) {
      updateSubject(currentSubject.id, {
        code: currentSubject.code.trim().toUpperCase(),
        name: currentSubject.name.trim(),
        department: currentSubject.department,
        semester: Number(currentSubject.semester),
        durationMinutes: Number(currentSubject.durationMinutes),
        enrolledStudentIds: currentSubject.enrolledStudentIds || [],
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
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
                Manage Subjects & Examinations
              </h1>
              <p className="text-xs text-slate-500">
                Define subject codes, durations, and manage enrolled students for clash calculation
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#438DFF] hover:bg-[#2563EB] rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search code or subject name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#438DFF]/30 focus:border-[#438DFF]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-semibold">Department:</span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-xl bg-white"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Subject Code</th>
                <th className="py-3 px-4">Subject Title</th>
                <th className="py-3 px-4">Department & Sem</th>
                <th className="py-3 px-4 text-center">Duration</th>
                <th className="py-3 px-4 text-center">Enrolled Students</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No subjects match your query.
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-extrabold text-[#438DFF] whitespace-nowrap">
                      {sub.code}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#0F172A]">
                      {sub.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {sub.department} (Sem {sub.semester})
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap font-medium text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sub.durationMinutes} mins</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 font-bold text-slate-700">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span>{sub.enrolledStudentIds.length} students</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(sub)}
                          className="p-1.5 text-slate-500 hover:text-[#438DFF] hover:bg-slate-100 rounded-lg transition"
                          title="Edit Subject"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete subject ${sub.code}?`)) {
                              deleteSubject(sub.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Subject"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Subject Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#0F172A]">
                {modalMode === 'create' ? 'Add New Examination Subject' : `Edit ${currentSubject.code}`}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS301"
                    value={currentSubject.code || ''}
                    onChange={(e) =>
                      setCurrentSubject({ ...currentSubject, code: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    min={30}
                    max={360}
                    step={15}
                    value={currentSubject.durationMinutes || 180}
                    onChange={(e) =>
                      setCurrentSubject({ ...currentSubject, durationMinutes: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures & Algorithms"
                  value={currentSubject.name || ''}
                  onChange={(e) =>
                    setCurrentSubject({ ...currentSubject, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={currentSubject.department || ''}
                    onChange={(e) =>
                      setCurrentSubject({ ...currentSubject, department: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Semester</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={currentSubject.semester || 4}
                    onChange={(e) =>
                      setCurrentSubject({ ...currentSubject, semester: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Student Enrollment Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">
                    Enrolled Students ({currentSubject.enrolledStudentIds?.length || 0})
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentSubject({
                        ...currentSubject,
                        enrolledStudentIds:
                          currentSubject.enrolledStudentIds?.length === students.length
                            ? []
                            : students.map((s) => s.id),
                      })
                    }
                    className="text-[11px] font-semibold text-[#438DFF] hover:underline"
                  >
                    {currentSubject.enrolledStudentIds?.length === students.length
                      ? 'Deselect All'
                      : 'Enroll All'}
                  </button>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1 border border-slate-200 p-2 rounded-xl">
                  {students.map((student) => {
                    const isEnrolled = currentSubject.enrolledStudentIds?.includes(student.id);
                    return (
                      <label
                        key={student.id}
                        className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer text-xs ${
                          isEnrolled ? 'bg-[#EAF4FF] text-[#438DFF] font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isEnrolled}
                            onChange={(e) => {
                              const prev = currentSubject.enrolledStudentIds || [];
                              const next = e.target.checked
                                ? [...prev, student.id]
                                : prev.filter((id) => id !== student.id);
                              setCurrentSubject({ ...currentSubject, enrolledStudentIds: next });
                            }}
                            className="accent-[#438DFF]"
                          />
                          <span>{student.name}</span>
                        </div>
                        <span className="text-slate-400 font-mono text-[10px]">{student.rollNo}</span>
                      </label>
                    );
                  })}
                </div>
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
                  {modalMode === 'create' ? 'Create Subject' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
