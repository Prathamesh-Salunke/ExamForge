import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Subject,
  Student,
  Classroom,
  ScheduledExam,
  ConflictEdge,
  GraphColoringResult,
  TimetableMetadata,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_SUBJECTS,
  INITIAL_CLASSROOMS,
} from '../data/defaultData';
import {
  buildConflictGraph,
  executeGreedyColoring,
  executeDSATURColoring,
} from '../algorithms/graphColoring';
import { allocateRoomsForExam } from '../algorithms/roomAllocator';
import { validateSchedule, FullValidationReport } from '../algorithms/validation';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  subjects: Subject[];
  students: Student[];
  classrooms: Classroom[];
  scheduledExams: ScheduledExam[];
  timetableMetadata: TimetableMetadata;
  algorithmPreference: 'GREEDY' | 'DSATUR';
  setAlgorithmPreference: (algo: 'GREEDY' | 'DSATUR') => void;
  conflictEdges: ConflictEdge[];
  adjacencyList: Map<string, Set<string>>;
  coloringResult: GraphColoringResult | null;
  validationReport: FullValidationReport;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Subject operations
  addSubject: (sub: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Classroom operations
  addClassroom: (room: Omit<Classroom, 'id'>) => void;
  updateClassroom: (id: string, updates: Partial<Classroom>) => void;
  deleteClassroom: (id: string) => void;

  // Student operations
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  registerStudentForSubject: (studentId: string, subjectId: string) => void;
  unregisterStudentFromSubject: (studentId: string, subjectId: string) => void;
  importStudentsCSV: (csvText: string) => { added: number; errors: string[] };

  // Timetable scheduling
  generateTimetable: (algo?: 'GREEDY' | 'DSATUR', startDate?: string) => boolean;
  saveTimetable: () => void;
  updateScheduledExam: (id: string, updates: Partial<ScheduledExam>) => void;
  resetToDemoData: () => void;
}

const STORAGE_KEY = 'examforge_data_v2';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or defaults
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_subjects`);
      return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
    } catch {
      return INITIAL_SUBJECTS;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [classrooms, setClassrooms] = useState<Classroom[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_classrooms`);
      return saved ? JSON.parse(saved) : INITIAL_CLASSROOMS;
    } catch {
      return INITIAL_CLASSROOMS;
    }
  });

  const [scheduledExams, setScheduledExams] = useState<ScheduledExam[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_scheduledExams`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [timetableMetadata, setTimetableMetadata] = useState<TimetableMetadata>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_metadata`);
      return saved
        ? JSON.parse(saved)
        : {
            academicYear: '2025-2026',
            semesterName: 'Spring End-Semester 2026',
            generatedAt: '',
            algorithm: 'GREEDY',
            totalExams: 0,
            totalRoomsUsed: 0,
            isValid: true,
            status: 'SAVED',
          };
    } catch {
      return {
        academicYear: '2025-2026',
        semesterName: 'Spring End-Semester 2026',
        generatedAt: '',
        algorithm: 'GREEDY',
        totalExams: 0,
        totalRoomsUsed: 0,
        isValid: true,
        status: 'SAVED',
      };
    }
  });

  const [algorithmPreference, setAlgorithmPreference] = useState<'GREEDY' | 'DSATUR'>('GREEDY');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Persistent storage sync
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_subjects`, JSON.stringify(subjects));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [subjects]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(students));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_classrooms`, JSON.stringify(classrooms));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [classrooms]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_scheduledExams`, JSON.stringify(scheduledExams));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [scheduledExams]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_metadata`, JSON.stringify(timetableMetadata));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [timetableMetadata]);

  // Toast notifications
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Compute Conflict Graph whenever subjects or student registrations change
  const { conflictEdges, adjacencyList } = useMemo(() => {
    return buildConflictGraph(subjects, students);
  }, [subjects, students]);

  // Compute Coloring Result dynamically based on preferred algorithm
  const coloringResult = useMemo(() => {
    if (subjects.length === 0) return null;
    const res =
      algorithmPreference === 'DSATUR'
        ? executeDSATURColoring(subjects, adjacencyList)
        : executeGreedyColoring(subjects, adjacencyList);
    res.conflictEdges = conflictEdges;
    return res;
  }, [subjects, adjacencyList, algorithmPreference, conflictEdges]);

  // Validation report dynamically evaluated for current scheduled exams
  const validationReport = useMemo(() => {
    return validateSchedule(scheduledExams, subjects, students, classrooms);
  }, [scheduledExams, subjects, students, classrooms]);

  // Subject operations
  const addSubject = (subData: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subData,
      id: `SUB-${Date.now()}`,
    };
    setSubjects((prev) => [...prev, newSubject]);
    showToast(`Added subject ${newSubject.code} (${newSubject.name})`, 'success');
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    showToast(`Updated subject details`, 'success');
  };

  const deleteSubject = (id: string) => {
    const target = subjects.find((s) => s.id === id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setScheduledExams((prev) => prev.filter((e) => e.subjectId !== id));
    showToast(`Deleted subject ${target?.code || id}`, 'info');
  };

  // Classroom operations
  const addClassroom = (roomData: Omit<Classroom, 'id'>) => {
    const newRoom: Classroom = {
      ...roomData,
      id: `RM-${Date.now()}`,
    };
    setClassrooms((prev) => [...prev, newRoom]);
    showToast(`Added classroom ${newRoom.name} (${newRoom.capacity} seats)`, 'success');
  };

  const updateClassroom = (id: string, updates: Partial<Classroom>) => {
    setClassrooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    showToast(`Classroom updated successfully`, 'success');
  };

  const deleteClassroom = (id: string) => {
    const target = classrooms.find((r) => r.id === id);
    setClassrooms((prev) => prev.filter((r) => r.id !== id));
    showToast(`Classroom ${target?.name || id} removed`, 'info');
  };

  // Student operations
  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...studentData,
      id: `STU-${Date.now()}`,
    };
    setStudents((prev) => [...prev, newStudent]);
    showToast(`Enrolled student ${newStudent.name} (${newStudent.rollNo})`, 'success');
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    showToast(`Student details updated`, 'success');
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    // Also remove student from all subjects
    setSubjects((prev) =>
      prev.map((s) => ({
        ...s,
        enrolledStudentIds: s.enrolledStudentIds.filter((sid) => sid !== id),
      }))
    );
    showToast(`Student removed and de-registered from all exams`, 'info');
  };

  const registerStudentForSubject = (studentId: string, subjectId: string) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id === subjectId) {
          if (s.enrolledStudentIds.includes(studentId)) return s;
          return { ...s, enrolledStudentIds: [...s.enrolledStudentIds, studentId] };
        }
        return s;
      })
    );
    showToast(`Student registered for examination`, 'success');
  };

  const unregisterStudentFromSubject = (studentId: string, subjectId: string) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id === subjectId) {
          return {
            ...s,
            enrolledStudentIds: s.enrolledStudentIds.filter((id) => id !== studentId),
          };
        }
        return s;
      })
    );
    showToast(`Registration removed`, 'info');
  };

  const importStudentsCSV = (csvText: string) => {
    const lines = csvText.split('\n').filter((l) => l.trim().length > 0);
    let added = 0;
    const errors: string[] = [];

    // Header check
    const startIndex = lines[0]?.toLowerCase().includes('roll') ? 1 : 0;
    const existingRolls = new Set(students.map((s) => s.rollNo.toLowerCase()));

    const newStudents: Student[] = [];

    for (let i = startIndex; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim());
      if (parts.length < 2) continue;

      const rollNo = parts[0];
      const name = parts[1];
      const email = parts[2] || `${rollNo.toLowerCase()}@college.edu`;
      const department = parts[3] || 'Computer Science';
      const semester = parseInt(parts[4]) || 4;

      if (existingRolls.has(rollNo.toLowerCase())) {
        errors.push(`Row ${i + 1}: Roll No "${rollNo}" already registered.`);
        continue;
      }

      existingRolls.add(rollNo.toLowerCase());
      newStudents.push({
        id: `STU-CSV-${Date.now()}-${i}`,
        rollNo,
        name,
        email,
        department,
        semester,
      });
      added++;
    }

    if (newStudents.length > 0) {
      setStudents((prev) => [...prev, ...newStudents]);
      showToast(`Imported ${added} students successfully`, 'success');
    }

    return { added, errors };
  };

  // Timetable Generation Workflow
  const generateTimetable = useCallback(
    (algo: 'GREEDY' | 'DSATUR' = algorithmPreference, startDate: string = '2026-05-11'): boolean => {
      if (subjects.length === 0) {
        showToast('Please add at least one subject to generate timetable', 'error');
        return false;
      }

      const activeRooms = classrooms.filter((r) => r.isActive);
      if (activeRooms.length === 0) {
        showToast('No active classrooms available! Please mark at least one classroom active.', 'error');
        return false;
      }

      // Step 1: Color graph using chosen algorithm
      const coloring =
        algo === 'DSATUR'
          ? executeDSATURColoring(subjects, adjacencyList)
          : executeGreedyColoring(subjects, adjacencyList);

      // Step 2: Map colors to dates & time intervals
      // We schedule 2 slots per day (Morning: 09:30-12:30, Afternoon: 01:30-04:30)
      const baseDate = new Date(startDate);

      const generatedExams: ScheduledExam[] = [];
      const roomsUsedSet = new Set<string>();

      // Group subjects by assigned color slot
      const slotBuckets: Record<number, Subject[]> = {};
      Object.entries(coloring.vertexColors).forEach(([subjectId, colorIndex]) => {
        if (!slotBuckets[colorIndex]) slotBuckets[colorIndex] = [];
        const sub = subjects.find((s) => s.id === subjectId);
        if (sub) slotBuckets[colorIndex].push(sub);
      });

      // Sort slot indexes ascending
      const sortedColorKeys = Object.keys(slotBuckets)
        .map(Number)
        .sort((a, b) => a - b);

      let allocationFailureReason: string | null = null;

      sortedColorKeys.forEach((colorIndex) => {
        const subjectsInSlot = slotBuckets[colorIndex];
        const slotConfig = coloring.colorToSlotMap[colorIndex] || {
          slotIndex: colorIndex,
          name: `Slot ${colorIndex + 1}`,
          startTime: '09:30',
          endTime: '12:30',
          colorHex: '#438DFF',
        };

        // Determine date: 2 slots per calendar exam day
        const dayOffset = Math.floor(colorIndex / 2);
        const isAfternoon = colorIndex % 2 === 1;

        const examDateObj = new Date(baseDate);
        examDateObj.setDate(baseDate.getDate() + dayOffset);

        // Skip Sunday if hits Sunday
        if (examDateObj.getDay() === 0) {
          examDateObj.setDate(examDateObj.getDate() + 1);
        }

        const dateStr = examDateObj.toISOString().slice(0, 10);
        const startTime = isAfternoon ? '13:30' : '09:30';
        const endTime = isAfternoon ? '16:30' : '12:30';

        // Allocate rooms for each exam in this slot
        // Track rooms already occupied within this exact slot
        const occupiedRoomIdsInSlot = new Set<string>();

        // Sort exams by student count descending (largest first)
        const sortedSubs = [...subjectsInSlot].sort(
          (a, b) => b.enrolledStudentIds.length - a.enrolledStudentIds.length
        );

        sortedSubs.forEach((sub) => {
          const availableRoomsForThisExam = activeRooms.filter(
            (r) => !occupiedRoomIdsInSlot.has(r.id)
          );

          const allocResult = allocateRoomsForExam(sub, availableRoomsForThisExam, true);

          if (!allocResult.isFullySeated) {
            allocationFailureReason = `Could not allocate room for ${sub.code} in ${slotConfig.name}: ${allocResult.failureReason}`;
          }

          allocResult.assignedRoomIds.forEach((rid) => {
            occupiedRoomIdsInSlot.add(rid);
            roomsUsedSet.add(rid);
          });

          generatedExams.push({
            id: `EXAM-${sub.id}`,
            subjectId: sub.id,
            subjectCode: sub.code,
            subjectName: sub.name,
            date: dateStr,
            startTime,
            endTime,
            timeSlotIndex: colorIndex,
            colorHex: slotConfig.colorHex,
            assignedRoomIds: allocResult.assignedRoomIds,
            assignedRoomNames: allocResult.assignedRoomNames,
            totalStudents: sub.enrolledStudentIds.length,
            totalCapacityProvided: allocResult.totalCapacityProvided,
          });
        });
      });

      if (allocationFailureReason) {
        showToast(allocationFailureReason, 'error');
      }

      setScheduledExams(generatedExams);
      setTimetableMetadata({
        academicYear: '2025-2026',
        semesterName: 'Spring End-Semester 2026',
        generatedAt: new Date().toLocaleString(),
        algorithm: algo,
        totalExams: generatedExams.length,
        totalRoomsUsed: roomsUsedSet.size,
        isValid: !allocationFailureReason,
        status: 'DRAFT',
      });

      showToast(
        `Generated Draft Timetable using ${algo} Graph Coloring (${coloring.totalColorsUsed} time slots used)!`,
        'success'
      );
      return true;
    },
    [subjects, classrooms, adjacencyList, algorithmPreference, showToast]
  );

  const saveTimetable = () => {
    if (scheduledExams.length === 0) {
      showToast('No timetable to save! Please generate one first.', 'error');
      return;
    }
    setTimetableMetadata((prev) => ({ ...prev, status: 'SAVED' }));
    showToast('Timetable successfully validated and saved!', 'success');
  };

  const updateScheduledExam = (id: string, updates: Partial<ScheduledExam>) => {
    setScheduledExams((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
    setTimetableMetadata((prev) => ({ ...prev, status: 'DRAFT' }));
    showToast('Updated exam schedule. Re-validating...', 'info');
  };

  const resetToDemoData = () => {
    setSubjects(INITIAL_SUBJECTS);
    setStudents(INITIAL_STUDENTS);
    setClassrooms(INITIAL_CLASSROOMS);
    setScheduledExams([]);
    setTimetableMetadata({
      academicYear: '2025-2026',
      semesterName: 'Spring End-Semester 2026',
      generatedAt: '',
      algorithm: 'GREEDY',
      totalExams: 0,
      totalRoomsUsed: 0,
      isValid: true,
      status: 'SAVED',
    });
    localStorage.removeItem(`${STORAGE_KEY}_subjects`);
    localStorage.removeItem(`${STORAGE_KEY}_students`);
    localStorage.removeItem(`${STORAGE_KEY}_classrooms`);
    localStorage.removeItem(`${STORAGE_KEY}_scheduledExams`);
    localStorage.removeItem(`${STORAGE_KEY}_metadata`);
    showToast('Restored original college sample dataset!', 'info');
  };

  // Pre-generate timetable on first load if scheduledExams is empty
  useEffect(() => {
    if (scheduledExams.length === 0 && subjects.length > 0) {
      generateTimetable('GREEDY');
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        subjects,
        students,
        classrooms,
        scheduledExams,
        timetableMetadata,
        algorithmPreference,
        setAlgorithmPreference,
        conflictEdges,
        adjacencyList,
        coloringResult,
        validationReport,
        toasts,
        showToast,
        removeToast,
        addSubject,
        updateSubject,
        deleteSubject,
        addClassroom,
        updateClassroom,
        deleteClassroom,
        addStudent,
        updateStudent,
        deleteStudent,
        registerStudentForSubject,
        unregisterStudentFromSubject,
        importStudentsCSV,
        generateTimetable,
        saveTimetable,
        updateScheduledExam,
        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
