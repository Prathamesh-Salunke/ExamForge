import { describe, it, expect } from 'vitest';
import {
  doIntervalsOverlap,
  findVacantClassrooms,
  allocateRoomsForExam,
} from '../roomAllocator';
import { Classroom, ScheduledExam, Subject } from '../../types';

describe('Room Allocator and Interval Overlap Logic', () => {
  it('correctly calculates time interval overlaps', () => {
    // Overlapping: 10:00 - 12:00 and 11:30 - 12:30
    expect(doIntervalsOverlap('10:00', '12:00', '11:30', '12:30')).toBe(true);

    // Contained: 09:00 - 13:00 and 10:00 - 11:00
    expect(doIntervalsOverlap('09:00', '13:00', '10:00', '11:00')).toBe(true);

    // Completely disjoint
    expect(doIntervalsOverlap('09:00', '11:00', '13:00', '15:00')).toBe(false);

    // Abutting boundary: 09:30 - 12:30 and 12:30 - 15:30 (half-open, should not overlap)
    expect(doIntervalsOverlap('09:30', '12:30', '12:30', '15:30')).toBe(false);
  });

  const sampleRooms: Classroom[] = [
    { id: 'R1', name: 'Room 101', building: 'Block A', floor: 1, capacity: 50, isActive: true, isLab: false },
    { id: 'R2', name: 'Room 102', building: 'Block A', floor: 1, capacity: 30, isActive: true, isLab: false },
    { id: 'R3', name: 'Room 103 (Repair)', building: 'Block A', floor: 1, capacity: 40, isActive: false, isLab: false },
  ];

  const scheduledExams: ScheduledExam[] = [
    {
      id: 'e1',
      subjectId: 's1',
      subjectCode: 'CS101',
      subjectName: 'Exam 1',
      date: '2026-05-10',
      startTime: '09:30',
      endTime: '12:30',
      timeSlotIndex: 0,
      colorHex: '#438DFF',
      assignedRoomIds: ['R1'],
      assignedRoomNames: ['Room 101'],
      totalStudents: 40,
      totalCapacityProvided: 50,
    },
  ];

  it('marks a room occupied during an overlapping interval as unavailable', () => {
    const vacancy = findVacantClassrooms(
      sampleRooms,
      scheduledExams,
      '2026-05-10',
      '11:00',
      '13:00',
      25
    );

    const r1 = vacancy.find((v) => v.classroom.id === 'R1')!;
    expect(r1.isAvailable).toBe(false);
    expect(r1.isSuitable).toBe(false);
    expect(r1.conflictingExam?.subjectCode).toBe('CS101');
  });

  it('marks an unoccupied room with sufficient capacity as suitable', () => {
    const vacancy = findVacantClassrooms(
      sampleRooms,
      scheduledExams,
      '2026-05-10',
      '09:30',
      '12:30',
      25
    );

    const r2 = vacancy.find((v) => v.classroom.id === 'R2')!;
    expect(r2.isAvailable).toBe(true);
    expect(r2.isCapacitySufficient).toBe(true);
    expect(r2.isSuitable).toBe(true);
    expect(r2.remainingSeats).toBe(5); // 30 - 25 = 5
  });

  it('marks a room with insufficient capacity as unsuitable for single allocation', () => {
    const vacancy = findVacantClassrooms(
      sampleRooms,
      scheduledExams,
      '2026-05-10',
      '09:30',
      '12:30',
      35 // R2 only has 30 seats
    );

    const r2 = vacancy.find((v) => v.classroom.id === 'R2')!;
    expect(r2.isAvailable).toBe(true);
    expect(r2.isCapacitySufficient).toBe(false);
    expect(r2.isSuitable).toBe(false);
  });

  it('marks an inactive room as unsuitable even if vacant', () => {
    const vacancy = findVacantClassrooms(
      sampleRooms,
      scheduledExams,
      '2026-05-10',
      '09:30',
      '12:30',
      20
    );

    const r3 = vacancy.find((v) => v.classroom.id === 'R3')!;
    expect(r3.isAvailable).toBe(true);
    expect(r3.isSuitable).toBe(false);
    expect(r3.unsuitabilityReason).toContain('inactive');
  });

  it('allocates best-fit single room or multi-room accurately', () => {
    const sub: Subject = {
      id: 'sub-large',
      code: 'CS999',
      name: 'Mega Exam',
      department: 'CS',
      semester: 4,
      durationMinutes: 120,
      enrolledStudentIds: Array.from({ length: 70 }, (_, i) => `stu-${i}`),
    };

    // R1 has 50, R2 has 30. Single room won't fit 70.
    // Multi-room combining R1 (50) + R2 (30) = 80 >= 70.
    const result = allocateRoomsForExam(sub, sampleRooms, true);
    expect(result.isFullySeated).toBe(true);
    expect(result.assignedRoomIds).toContain('R1');
    expect(result.assignedRoomIds).toContain('R2');
    expect(result.totalCapacityProvided).toBe(80);
  });
});
