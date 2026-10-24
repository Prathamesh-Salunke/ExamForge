import { describe, it, expect } from 'vitest';
import {
  INITIAL_SUBJECTS,
  INITIAL_STUDENTS,
  INITIAL_CLASSROOMS,
} from '../../data/defaultData';
import {
  buildConflictGraph,
  executeGreedyColoring,
  executeDSATURColoring,
} from '../graphColoring';
import { findVacantClassrooms, allocateRoomsForExam } from '../roomAllocator';
import { validateSchedule } from '../validation';
import { ScheduledExam } from '../../types';

describe('College Examination Demonstration Scenario', () => {
  it('correctly maps all 8 initial college subjects and detects expected conflict edges', () => {
    const { conflictEdges, adjacencyList } = buildConflictGraph(
      INITIAL_SUBJECTS,
      INITIAL_STUDENTS
    );

    // CS301 (Data Structures) and CS302 (Database) share students STU-01 through STU-08
    expect(adjacencyList.get('SUB-CS301')?.has('SUB-CS302')).toBe(true);

    // Find specific edge
    const cs301_cs302_edge = conflictEdges.find(
      (e) =>
        (e.sourceId === 'SUB-CS301' && e.targetId === 'SUB-CS302') ||
        (e.sourceId === 'SUB-CS302' && e.targetId === 'SUB-CS301')
    );
    expect(cs301_cs302_edge).toBeDefined();
    expect(cs301_cs302_edge!.conflictCount).toBeGreaterThanOrEqual(8);
  });

  it('guarantees that CS301 and CS302 are NEVER placed in the same time slot by Welsh-Powell', () => {
    const { adjacencyList } = buildConflictGraph(INITIAL_SUBJECTS, INITIAL_STUDENTS);
    const greedyResult = executeGreedyColoring(INITIAL_SUBJECTS, adjacencyList);

    const cs301Color = greedyResult.vertexColors['SUB-CS301'];
    const cs302Color = greedyResult.vertexColors['SUB-CS302'];

    expect(cs301Color).not.toBe(cs302Color);
  });

  it('guarantees that CS301 and CS302 are NEVER placed in the same time slot by DSATUR', () => {
    const { adjacencyList } = buildConflictGraph(INITIAL_SUBJECTS, INITIAL_STUDENTS);
    const dsaturResult = executeDSATURColoring(INITIAL_SUBJECTS, adjacencyList);

    const cs301Color = dsaturResult.vertexColors['SUB-CS301'];
    const cs302Color = dsaturResult.vertexColors['SUB-CS302'];

    expect(cs301Color).not.toBe(cs302Color);
  });

  it('validates that an independent elective can share a slot with a core CS course', () => {
    const { adjacencyList } = buildConflictGraph(INITIAL_SUBJECTS, INITIAL_STUDENTS);
    const greedyResult = executeGreedyColoring(INITIAL_SUBJECTS, adjacencyList);

    // EC204 has students STU-31 to STU-35. CS301 has CS students. They do NOT share students!
    expect(adjacencyList.get('SUB-EC204')?.has('SUB-CS301')).toBe(false);

    // Total time slots should be <= 5 (efficient scheduling)
    expect(greedyResult.totalColorsUsed).toBeLessThanOrEqual(5);
  });

  it('proves that a room occupied from 09:30 to 12:30 is flagged UNAVAILABLE for an overlapping request from 11:00 to 14:00', () => {
    const sampleExam: ScheduledExam = {
      id: 'EXAM-1',
      subjectId: 'SUB-CS301',
      subjectCode: 'CS301',
      subjectName: 'Data Structures',
      date: '2026-05-11',
      startTime: '09:30',
      endTime: '12:30',
      timeSlotIndex: 0,
      colorHex: '#438DFF',
      assignedRoomIds: ['RM-AUDI'],
      assignedRoomNames: ['Central Auditorium'],
      totalStudents: 18,
      totalCapacityProvided: 75,
    };

    const vacancy = findVacantClassrooms(
      INITIAL_CLASSROOMS,
      [sampleExam],
      '2026-05-11',
      '11:00',
      '14:00',
      20
    );

    const audiStatus = vacancy.find((v) => v.classroom.id === 'RM-AUDI')!;
    expect(audiStatus.isAvailable).toBe(false);
    expect(audiStatus.isSuitable).toBe(false);
    expect(audiStatus.conflictingExam?.subjectCode).toBe('CS301');
  });

  it('validates a complete collision-free schedule with zero errors', () => {
    const validExams: ScheduledExam[] = [
      {
        id: 'e1',
        subjectId: 'SUB-CS301',
        subjectCode: 'CS301',
        subjectName: 'DSA',
        date: '2026-05-11',
        startTime: '09:30',
        endTime: '12:30',
        timeSlotIndex: 0,
        colorHex: '#438DFF',
        assignedRoomIds: ['RM-AUDI'],
        assignedRoomNames: ['Central Auditorium'],
        totalStudents: 18,
        totalCapacityProvided: 75,
      },
      {
        id: 'e2',
        subjectId: 'SUB-CS302',
        subjectCode: 'CS302',
        subjectName: 'DBMS',
        date: '2026-05-11',
        startTime: '13:30', // Disjoint afternoon slot!
        endTime: '16:30',
        timeSlotIndex: 1,
        colorHex: '#A78BFA',
        assignedRoomIds: ['RM-LH101'],
        assignedRoomNames: ['Lecture Hall 101'],
        totalStudents: 13,
        totalCapacityProvided: 45,
      },
    ];

    const report = validateSchedule(
      validExams,
      INITIAL_SUBJECTS.slice(0, 2),
      INITIAL_STUDENTS,
      INITIAL_CLASSROOMS
    );

    expect(report.isValid).toBe(true);
    expect(report.errorCount).toBe(0);
  });
});
