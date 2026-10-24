import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Upload,
  Edit2,
  Trash2,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';

export const StudentManager: React.FC = () => {
  const {
    students,
    subjects,
    addStudent,
    updateStudent,
    deleteStudent,
    registerStudentForSubject,
    unregisterStudentFromSubject,
    importStudentsCSV,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [currentStudent, setCurrentStudent] = useState<Partial<Student>>({});
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [selectedStudentForSubjects, setSelectedStudentForSubjects] = useState<Student | null>(null);

  // Departments
  const departments = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.department)));
  }, [students]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = departmentFilter === 'all' || s.department === departmentFilter;
      return matchSearch && matchDept;
    });
  }, [students, searchQuery, departmentFilter]);

  const handleOpenCreate = () => {
    setCurrentStudent({
      rollNo: '',
      name: '',
      email: '',
      department: 'Computer Science',
      semester: 4,
    });
    setModalMode('create');
  };

  const handleOpenEdit = (stu: Student) => {
    setCurrentStudent({ ...stu });
    setModalMode('edit');
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent.rollNo?.trim() || !currentStudent.name?.trim()) {
      showToast('Roll Number and Student Name are required', 'error');
      return;
    }

    if (modalMode === 'create') {
      if (
        students.some(
          (s) => s.rollNo.toLowerCase() === currentStudent.rollNo?.trim().toLowerCase()
        )
      ) {
        showToast(`Roll Number "${currentStudent.rollNo}" already registered!`, 'error');
        return;
      }

      addStudent({
        rollNo: currentStudent.rollNo.trim(),
        name: currentStudent.name.trim(),
        email:
          currentStudent.email?.trim() ||
          `${currentStudent.rollNo.trim().toLowerCase()}@college.edu`,
        department: currentStudent.department || 'Computer Science',
        semester: Number(currentStudent.semester) || 4,
      });
    } else if (modalMode === 'edit' && currentStudent.id) {
      updateStudent(currentStudent.id, {
        rollNo: currentStudent.rollNo.trim(),
        name: currentStudent.name.trim(),
        email: currentStudent.email?.trim(),
        department: currentStudent.department,
        semester: Number(currentStudent.semester),
      });
    }

    setModalMode(null);
  };

  const handleImportCSV = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent.trim()) {
      showToast('Please paste or select CSV content first', 'error');
      return;
    }

    const { added, errors } = importStudentsCSV(csvContent);
    if (errors.length > 0) {
      showToast(`Imported with ${errors.length} duplicate/invalid records`, 'info');
    }
    setCsvContent('');
    setCsvModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#EAF4FF] text-[#438DFF]">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
                Student Registration & Roster
              </h1>
              <p className="text-xs text-slate-500">
                Enroll students in examination subjects to automatically calculate conflict edges
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCsvModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition"
          >
            <Upload className="w-4 h-4 text-[#438DFF]" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#438DFF] hover:bg-[#2563EB] rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search roll number, student name, email..."
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
            <option value="all">All Departments ({departments.length})</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Registered Examinations</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No students match your query.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => {
                  const studentSubs = subjects.filter((s) =>
                    s.enrolledStudentIds.includes(stu.id)
                  );

                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#438DFF] whitespace-nowrap">
                        {stu.rollNo}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#0F172A] whitespace-nowrap">
                        {stu.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {stu.email}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {stu.department} (Sem {stu.semester})
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedStudentForSubjects(stu)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EAF4FF] text-[#438DFF] hover:bg-[#D9EBFF] font-bold transition"
                          title="Click to view/manage subject registrations"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>{studentSubs.length} Subjects</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(stu)}
                            className="p-1.5 text-slate-500 hover:text-[#438DFF] hover:bg-slate-100 rounded-lg transition"
                            title="Edit Student"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Remove student ${stu.name}?`)) {
                                deleteStudent(stu.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Subject Registration Modal */}
      {selectedStudentForSubjects && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">
                  Exam Enrollments: {selectedStudentForSubjects.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Roll No: {selectedStudentForSubjects.rollNo} • {selectedStudentForSubjects.department}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentForSubjects(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Toggle examination enrollments. Adding or removing subjects immediately recalculates the conflict graph $G=(V,E)$!
            </p>

            <div className="max-h-72 overflow-y-auto space-y-2 border border-slate-200 p-2.5 rounded-xl">
              {subjects.map((sub) => {
                const isEnrolled = sub.enrolledStudentIds.includes(
                  selectedStudentForSubjects.id
                );

                return (
                  <div
                    key={sub.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                      isEnrolled
                        ? 'bg-[#EAF4FF] border-[#438DFF]/40 text-[#0F172A]'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span className="text-[#438DFF]">{sub.code}</span>
                        <span>•</span>
                        <span>{sub.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {sub.department} • {sub.enrolledStudentIds.length} students enrolled
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (isEnrolled) {
                          unregisterStudentFromSubject(
                            selectedStudentForSubjects.id,
                            sub.id
                          );
                        } else {
                          registerStudentForSubject(
                            selectedStudentForSubjects.id,
                            sub.id
                          );
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                        isEnrolled
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'bg-[#438DFF] text-white hover:bg-[#2563EB]'
                      }`}
                    >
                      {isEnrolled ? 'Drop Exam' : 'Enroll'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedStudentForSubjects(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#438DFF]" />
                <span>Import Students from CSV</span>
              </h3>
              <button
                onClick={() => setCsvModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Paste CSV text formatted as: <code>RollNo, Name, Email, Department, Semester</code>
            </p>

            <form onSubmit={handleImportCSV} className="space-y-4 text-xs">
              <textarea
                rows={6}
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                placeholder={`RollNo, Name, Email, Department, Semester\n24-CS-901, John Doe, john.d@college.edu, Computer Science, 4\n24-IT-902, Jane Smith, jane.s@college.edu, Information Technology, 4`}
                className="w-full p-3 font-mono text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#438DFF]/30 focus:border-[#438DFF]"
              />

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setCsvContent(
                      `RollNo, Name, Email, Department, Semester\n24-CS-901, Aryan Patel, aryan.p@college.edu, Computer Science, 4\n24-IT-902, Simran Kaur, simran.k@college.edu, Information Technology, 4\n24-AI-903, Siddhant Sen, siddhant.s@college.edu, AI & Data Science, 4`
                    )
                  }
                  className="text-xs font-semibold text-[#438DFF] hover:underline"
                >
                  Load Sample Data
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCsvModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#438DFF] hover:bg-[#2563EB] rounded-xl shadow-xs"
                  >
                    Import Records
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#0F172A]">
                {modalMode === 'create' ? 'Register New Student' : `Edit ${currentStudent.name}`}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Unique Roll Number / Identifier *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 24-CS-150"
                  value={currentStudent.rollNo || ''}
                  onChange={(e) =>
                    setCurrentStudent({ ...currentStudent, rollNo: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={currentStudent.name || ''}
                  onChange={(e) =>
                    setCurrentStudent({ ...currentStudent, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. rahul.s@college.edu"
                  value={currentStudent.email || ''}
                  onChange={(e) =>
                    setCurrentStudent({ ...currentStudent, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={currentStudent.department || 'Computer Science'}
                    onChange={(e) =>
                      setCurrentStudent({ ...currentStudent, department: e.target.value })
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
                    value={currentStudent.semester || 4}
                    onChange={(e) =>
                      setCurrentStudent({ ...currentStudent, semester: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#438DFF] hover:bg-[#2563EB] rounded-xl shadow-xs"
                >
                  {modalMode === 'create' ? 'Register Student' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
