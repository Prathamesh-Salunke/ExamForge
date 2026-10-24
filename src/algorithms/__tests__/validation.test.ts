import { describe, it, expect } from 'vitest';
import { validateSchedule } from '../validation';
import { Subject, Student, Classroom, ScheduledExam } from '../../types';

describe('Timetable Validation System', () => {
  const students: Student[] = [
    { id: 's1', rollNo: '01', name: 'Alice', email: 'a@c.edu', department: 'CS', semester: 4 },
  ];

  const subjects: Subject[] = [
    { id: 'sub-1', code: 'CS101', name: 'Math', department: 'CS', semester: 4, durationMinutes: 120, enrolledStudentIds: ['s1'] },
    { id: 'sub-2', code: 'CS102', name: 'Physics', department: 'CS', semester: 4, durationMinutes: 120, enrolledStudentIds: ['s1'] },
  ];

  const classrooms: Classroom[] = [
    { id: 'r1', name: 'Room 1', building: 'A', floor: 1, capacity: 50, isActive: true, isLab: false },
    { id: 'r2', name: 'Room 2', building: 'A', floor: 1, capacity: 5, isActive: true, isLab: false },
  ];

  it('flags an error when two overlapping exams share a student', () => {
    const invalidExams: ScheduledExam[] = [
      {
        id: 'e1',
        subjectId: 'sub-1',
        subjectCode: 'CS101',
        subjectName: 'Math',
        date: '2026-05-10',
        startTime: '09:30',
        endTime: '12:30',
        timeSlotIndex: 0,
        colorHex: '#438DFF',
        assignedRoomIds: ['r1'],
        assignedRoomNames: ['Room 1'],
        totalStudents: 1,
        totalCapacityProvided: 50,
      },
      {
        id: 'e2',
        subjectId: 'sub-2',
        subjectCode: 'CS102',
        subjectName: 'Physics',
        date: '2026-05-10',
        startTime: '10:00', // Overlaps with e1!
        endTime: '13:00',
        timeSlotIndex: 0,
        colorHex: '#438DFF',
        assignedRoomIds: ['r2'],
        assignedRoomNames: ['Room 2'],
        totalStudents: 1,
        totalCapacityProvided: 5,
      },
    ];

    const report = validateSchedule(invalidExams, subjects, students, classrooms);
    expect(report.isValid).toBe(false);
    expect(report.issues.some((i) => i.type === 'STUDENT_CONFLICT')).toBe(true);
  });

  it('flags an error when the same room is double-booked in overlapping intervals', () => {
    // sub-2 doesn't have student s1
    const subNoOverlap: Subject[] = [
      { id: 'sub-1', code: 'CS101', name: 'Math', department: 'CS', semester: 4, durationMinutes: 120, enrolledStudentIds: ['s1'] },
      { id: 'sub-2', code: 'CS102', name: 'Physics', department: 'CS', semester: 4, durationMinutes: 120, enrolledStudentIds: [] },
    ];

    const doubleBookedExams: ScheduledExam[] = [
      {
        id: 'e1',
        subjectId: 'sub-1',
        subjectCode: 'CS101',
        subjectName: 'Math',
        date: '2026-05-10',
        startTime: '09:30',
        endTime: '12:30',
        timeSlotIndex: 0,
        colorHex: '#438DFF',
        assignedRoomIds: ['r1'],
        assignedRoomNames: ['Room 1'],
        totalStudents: 1,
        totalCapacityProvided: 50,
      },
      {
        id: 'e2',
        subjectId: 'sub-2',
        subjectCode: 'CS102',
        subjectName: 'Physics',
        date: '2026-05-10',
        startTime: '11:00', // Overlaps in same room r1!
        endTime: '14:00',
        timeSlotIndex: 0,
        colorHex: '#438DFF',
        assignedRoomIds: ['r1'],
        assignedRoomNames: ['Room 1'],
        totalStudents: 1,
        totalCapacityProvided: 50,
      },
    ];

    const report = validateSchedule(doubleBookedExams, subNoOverlap, students, classrooms);
    expect(report.isValid).toBe(false);
    expect(report.issues.some((i) => i.type === 'ROOM_DOUBLE_BOOKED')).toBe(true);
  });
});
