import { describe, it, expect } from 'vitest';
import {
  buildConflictGraph,
  executeGreedyColoring,
  executeDSATURColoring,
} from '../graphColoring';
import { Subject, Student } from '../../types';

describe('Graph Coloring Algorithms', () => {
  const students: Student[] = [
    { id: 's1', rollNo: '01', name: 'Alice', email: 'a@c.edu', department: 'CS', semester: 4 },
    { id: 's2', rollNo: '02', name: 'Bob', email: 'b@c.edu', department: 'CS', semester: 4 },
    { id: 's3', rollNo: '03', name: 'Charlie', email: 'c@c.edu', department: 'IT', semester: 4 },
  ];

  // Subject A & B share student s1
  // Subject B & C share student s2
  // Subject D has only student s3 (independent of A & B)
  const subjects: Subject[] = [
    { id: 'sub-A', code: 'CS101', name: 'Subject A', department: 'CS', semester: 4, durationMinutes: 120, enrolledStudentIds: ['s1'] },
    { id: 'sub-B', code: 'CS102', name: 'Subject B', department: 'CS', semester: 4, durationMinutes: 120, enrolledStudentIds: ['s1', 's2'] },
    { id: 'sub-C', code: 'CS103', name: 'Subject C', department: 'CS', semester: 4, durationMinutes: 120, enrolledStudentIds: ['s2'] },
    { id: 'sub-D', code: 'IT101', name: 'Subject D', department: 'IT', semester: 4, durationMinutes: 120, enrolledStudentIds: ['s3'] },
  ];

  it('correctly constructs conflict graph G = (V, E)', () => {
    const { conflictEdges, adjacencyList } = buildConflictGraph(subjects, students);

    // A and B must have edge
    expect(adjacencyList.get('sub-A')?.has('sub-B')).toBe(true);
    // B and C must have edge
    expect(adjacencyList.get('sub-B')?.has('sub-C')).toBe(true);
    // A and C do not share any students
    expect(adjacencyList.get('sub-A')?.has('sub-C')).toBe(false);
    // D shares no students with A, B, or C
    expect(adjacencyList.get('sub-D')?.size).toBe(0);

    expect(conflictEdges.length).toBe(2);
  });

  it('ensures conflicting examinations never receive the same time slot in Greedy Coloring', () => {
    const { adjacencyList } = buildConflictGraph(subjects, students);
    const result = executeGreedyColoring(subjects, adjacencyList);

    // sub-A and sub-B must have different colors
    expect(result.vertexColors['sub-A']).not.toBe(result.vertexColors['sub-B']);
    // sub-B and sub-C must have different colors
    expect(result.vertexColors['sub-B']).not.toBe(result.vertexColors['sub-C']);
  });

  it('allows non-conflicting examinations to share the same time slot', () => {
    const { adjacencyList } = buildConflictGraph(subjects, students);
    const result = executeGreedyColoring(subjects, adjacencyList);

    // sub-A and sub-C have no shared students, so greedy coloring can give them the same slot
    expect(result.vertexColors['sub-A']).toBe(result.vertexColors['sub-C']);
  });

  it('ensures DSATUR graph coloring produces a valid coloring', () => {
    const { adjacencyList } = buildConflictGraph(subjects, students);
    const result = executeDSATURColoring(subjects, adjacencyList);

    expect(result.vertexColors['sub-A']).not.toBe(result.vertexColors['sub-B']);
    expect(result.vertexColors['sub-B']).not.toBe(result.vertexColors['sub-C']);
    expect(result.totalColorsUsed).toBeGreaterThanOrEqual(2);
  });
});
