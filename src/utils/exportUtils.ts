import * as XLSX from 'xlsx';
import { ScheduledExam, Classroom, RoomVacancyStatus, ConflictEdge, Subject, Student } from '../types';

/**
 * Downloads a Blob as a file in the browser.
 */
function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Exports Master Timetable as Excel (.xlsx) or CSV.
 */
export function exportTimetable(
  exams: ScheduledExam[],
  academicTerm: string = 'Spring 2026',
  format: 'xlsx' | 'csv' = 'xlsx'
) {
  const rows = exams.map((exam, idx) => ({
    'Sr No': idx + 1,
    'Subject Code': exam.subjectCode,
    'Subject Name': exam.subjectName,
    'Exam Date': exam.date,
    'Start Time': exam.startTime,
    'End Time': exam.endTime,
    'Assigned Room(s)': exam.assignedRoomNames.join(', '),
    'Registered Students': exam.totalStudents,
    'Seating Capacity': exam.totalCapacityProvided,
    'Time Slot': `Slot ${exam.timeSlotIndex + 1}`,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Timetable');

  const baseName = `ExamForge_Timetable_${academicTerm.replace(/\s+/g, '_')}`;

  if (format === 'csv') {
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${baseName}.csv`);
  } else {
    XLSX.writeFile(workbook, `${baseName}.xlsx`);
  }
}

/**
 * Exports Classroom Allocation Matrix.
 */
export function exportClassroomAllocations(
  classrooms: Classroom[],
  exams: ScheduledExam[],
  format: 'xlsx' | 'csv' = 'xlsx'
) {
  const rows: Record<string, string | number>[] = [];

  classrooms.forEach((room) => {
    const assignedExams = exams.filter((e) => e.assignedRoomIds.includes(room.id));
    if (assignedExams.length === 0) {
      rows.push({
        'Classroom': room.name,
        'Building': room.building,
        'Floor': room.floor,
        'Capacity': room.capacity,
        'Status': room.isActive ? 'Active (No Exams Assigned)' : 'Under Maintenance',
        'Exam Date': 'N/A',
        'Exam Time': 'N/A',
        'Subject Code': 'N/A',
        'Subject Name': 'N/A',
        'Students Seated': 0,
      });
    } else {
      assignedExams.forEach((exam) => {
        rows.push({
          'Classroom': room.name,
          'Building': room.building,
          'Floor': room.floor,
          'Capacity': room.capacity,
          'Status': room.isActive ? 'Active' : 'Under Maintenance',
          'Exam Date': exam.date,
          'Exam Time': `${exam.startTime} - ${exam.endTime}`,
          'Subject Code': exam.subjectCode,
          'Subject Name': exam.subjectName,
          'Students Seated': exam.totalStudents,
        });
      });
    }
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Classroom_Allocations');

  const baseName = `ExamForge_Classroom_Allocations_${new Date().toISOString().slice(0, 10)}`;

  if (format === 'csv') {
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${baseName}.csv`);
  } else {
    XLSX.writeFile(workbook, `${baseName}.xlsx`);
  }
}

/**
 * Exports Vacant Classroom Finder results.
 */
export function exportVacantRoomsReport(
  statuses: RoomVacancyStatus[],
  date: string,
  startTime: string,
  endTime: string,
  requiredCapacity: number,
  format: 'xlsx' | 'csv' = 'xlsx'
) {
  const rows = statuses.map((item, idx) => ({
    'Sr No': idx + 1,
    'Classroom': item.classroom.name,
    'Building': item.classroom.building,
    'Floor': item.classroom.floor,
    'Room Capacity': item.classroom.capacity,
    'Required Capacity': requiredCapacity,
    'Is Vacant': item.isAvailable ? 'YES' : 'NO',
    'Has Enough Seats': item.isCapacitySufficient ? 'YES' : 'NO',
    'Suitable for Exam': item.isSuitable ? 'SUITABLE' : 'UNSUITABLE',
    'Spare / Remaining Seats': item.remainingSeats,
    'Conflicting Exam / Reason': item.unsuitabilityReason || 'None (Available)',
    'Requested Interval': `${date} (${startTime} - ${endTime})`,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Vacant_Rooms');

  const baseName = `ExamForge_Vacant_Classrooms_${date}_${startTime.replace(':', '')}-${endTime.replace(':', '')}`;

  if (format === 'csv') {
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${baseName}.csv`);
  } else {
    XLSX.writeFile(workbook, `${baseName}.xlsx`);
  }
}

/**
 * Exports Student Conflict Graph edges and shared student details.
 */
export function exportConflictReport(
  conflictEdges: ConflictEdge[],
  subjects: Subject[],
  students: Student[],
  format: 'xlsx' | 'csv' = 'xlsx'
) {
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  const rows = conflictEdges.map((edge, idx) => {
    const s1 = subjectMap.get(edge.sourceId);
    const s2 = subjectMap.get(edge.targetId);
    return {
      'Sr No': idx + 1,
      'Subject 1 Code': s1?.code || edge.sourceId,
      'Subject 1 Name': s1?.name || '',
      'Subject 2 Code': s2?.code || edge.targetId,
      'Subject 2 Name': s2?.name || '',
      'Shared Students Count': edge.conflictCount,
      'Shared Students Names': edge.sharedStudentNames.join('; '),
      'Scheduling Constraint': 'Must be placed in DIFFERENT Time Slots',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Student_Conflicts');

  const baseName = `ExamForge_Conflict_Report_${new Date().toISOString().slice(0, 10)}`;

  if (format === 'csv') {
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${baseName}.csv`);
  } else {
    XLSX.writeFile(workbook, `${baseName}.xlsx`);
  }
}
