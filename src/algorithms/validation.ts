import { ScheduledExam, Subject, Student, Classroom, ValidationIssue } from '../types';
import { doIntervalsOverlap } from './roomAllocator';

export interface FullValidationReport {
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  issues: ValidationIssue[];
}

/**
 * Validates the entire examination schedule against college constraints:
 * 1. Student overlap conflicts
 * 2. Room double-booking conflicts
 * 3. Seating capacity deficits
 * 4. Inactive room allocations
 */
export function validateSchedule(
  exams: ScheduledExam[],
  subjects: Subject[],
  students: Student[],
  classrooms: Classroom[]
): FullValidationReport {
  const issues: ValidationIssue[] = [];
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const roomMap = new Map(classrooms.map((r) => [r.id, r]));

  // 1. Verify all exams are scheduled
  if (exams.length < subjects.length) {
    const scheduledSubIds = new Set(exams.map((e) => e.subjectId));
    const missing = subjects.filter((s) => !scheduledSubIds.has(s.id));
    if (missing.length > 0) {
      issues.push({
        type: 'STUDENT_CONFLICT',
        severity: 'WARNING',
        message: `${missing.length} subject(s) are not yet scheduled: ${missing.map((m) => m.code).join(', ')}`,
        subjectCodes: missing.map((m) => m.code),
      });
    }
  }

  // 2. Pairwise check between scheduled exams
  for (let i = 0; i < exams.length; i++) {
    const exam1 = exams[i];
    const sub1 = subjectMap.get(exam1.subjectId);
    const students1 = new Set(sub1?.enrolledStudentIds || []);

    // Check individual exam capacity
    if (exam1.totalCapacityProvided < exam1.totalStudents) {
      issues.push({
        type: 'CAPACITY_DEFICIT',
        severity: 'ERROR',
        message: `Capacity deficit in ${exam1.subjectCode}: ${exam1.totalStudents} students registered, but assigned rooms provide only ${exam1.totalCapacityProvided} seats.`,
        subjectCodes: [exam1.subjectCode],
      });
    }

    // Check inactive rooms
    exam1.assignedRoomIds.forEach((rId) => {
      const room = roomMap.get(rId);
      if (room && !room.isActive) {
        issues.push({
          type: 'ROOM_INACTIVE',
          severity: 'ERROR',
          message: `Classroom "${room.name}" assigned to ${exam1.subjectCode} is currently marked inactive!`,
          roomName: room.name,
          subjectCodes: [exam1.subjectCode],
        });
      }
    });

    for (let j = i + 1; j < exams.length; j++) {
      const exam2 = exams[j];

      // Check if exams are on the same date and overlapping in time
      if (exam1.date === exam2.date && doIntervalsOverlap(exam1.startTime, exam1.endTime, exam2.startTime, exam2.endTime)) {
        // A. Student conflict check
        const sub2 = subjectMap.get(exam2.subjectId);
        if (sub2) {
          const sharedStudents = sub2.enrolledStudentIds.filter((id) => students1.has(id));
          if (sharedStudents.length > 0) {
            issues.push({
              type: 'STUDENT_CONFLICT',
              severity: 'ERROR',
              message: `Student Conflict: ${exam1.subjectCode} and ${exam2.subjectCode} overlap on ${exam1.date} (${exam1.startTime}-${exam1.endTime}) and share ${sharedStudents.length} student(s)!`,
              subjectCodes: [exam1.subjectCode, exam2.subjectCode],
            });
          }
        }

        // B. Room double-booking check
        const sharedRooms = exam1.assignedRoomIds.filter((rId) => exam2.assignedRoomIds.includes(rId));
        if (sharedRooms.length > 0) {
          sharedRooms.forEach((rId) => {
            const rName = roomMap.get(rId)?.name || rId;
            issues.push({
              type: 'ROOM_DOUBLE_BOOKED',
              severity: 'ERROR',
              message: `Room Double-Booking: Classroom "${rName}" is assigned to both ${exam1.subjectCode} and ${exam2.subjectCode} at overlapping time (${exam1.date} ${exam1.startTime}-${exam1.endTime})!`,
              roomName: rName,
              subjectCodes: [exam1.subjectCode, exam2.subjectCode],
            });
          });
        }
      }
    }
  }

  const errorCount = issues.filter((i) => i.severity === 'ERROR').length;
  const warningCount = issues.filter((i) => i.severity === 'WARNING').length;

  return {
    isValid: errorCount === 0,
    errorCount,
    warningCount,
    issues,
  };
}
