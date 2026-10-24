import { Subject, Student, ConflictEdge, AlgorithmStep, GraphColoringResult, TimeSlotConfig } from '../types';

export const SLOT_PALETTE: string[] = [
  '#438DFF', // Slot 1 - Sky Blue (Theme primary)
  '#A78BFA', // Slot 2 - Soft Purple (Theme secondary)
  '#10B981', // Slot 3 - Soft Emerald
  '#F59E0B', // Slot 4 - Amber Gold
  '#06B6D4', // Slot 5 - Cyan
  '#EC4899', // Slot 6 - Rose Pink
  '#8B5CF6', // Slot 7 - Deep Violet
  '#F97316', // Slot 8 - Tangerine
  '#14B8A6', // Slot 9 - Teal
  '#6366F1', // Slot 10 - Indigo
  '#84CC16', // Slot 11 - Lime
  '#E11D48', // Slot 12 - Ruby
];

export const DEFAULT_TIME_SLOTS: Omit<TimeSlotConfig, 'colorHex'>[] = [
  { slotIndex: 0, name: 'Slot 1: Morning (09:30 AM - 12:30 PM)', startTime: '09:30', endTime: '12:30' },
  { slotIndex: 1, name: 'Slot 2: Afternoon (01:30 PM - 04:30 PM)', startTime: '13:30', endTime: '16:30' },
  { slotIndex: 2, name: 'Slot 3: Evening (05:00 PM - 08:00 PM)', startTime: '17:00', endTime: '20:00' },
  { slotIndex: 3, name: 'Slot 4: Next Day Morning (09:30 AM - 12:30 PM)', startTime: '09:30', endTime: '12:30' },
  { slotIndex: 4, name: 'Slot 5: Next Day Afternoon (01:30 PM - 04:30 PM)', startTime: '13:30', endTime: '16:30' },
  { slotIndex: 5, name: 'Slot 6: Day 3 Morning (09:30 AM - 12:30 PM)', startTime: '09:30', endTime: '12:30' },
  { slotIndex: 6, name: 'Slot 7: Day 3 Afternoon (01:30 PM - 04:30 PM)', startTime: '13:30', endTime: '16:30' },
  { slotIndex: 7, name: 'Slot 8: Day 4 Morning (09:30 AM - 12:30 PM)', startTime: '09:30', endTime: '12:30' },
];

/**
 * Builds the conflict graph G = (V, E).
 * Vertex = Examination / Subject
 * Edge = Shared student between two subjects
 */
export function buildConflictGraph(subjects: Subject[], students: Student[]): {
  conflictEdges: ConflictEdge[];
  adjacencyList: Map<string, Set<string>>;
  studentMap: Map<string, Student>;
} {
  const studentMap = new Map<string, Student>();
  students.forEach((s) => studentMap.set(s.id, s));

  const conflictEdges: ConflictEdge[] = [];
  const adjacencyList = new Map<string, Set<string>>();

  subjects.forEach((s) => adjacencyList.set(s.id, new Set<string>()));

  for (let i = 0; i < subjects.length; i++) {
    for (let j = i + 1; j < subjects.length; j++) {
      const s1 = subjects[i];
      const s2 = subjects[j];

      const set1 = new Set(s1.enrolledStudentIds);
      const sharedIds = s2.enrolledStudentIds.filter((id) => set1.has(id));

      if (sharedIds.length > 0) {
        const sharedNames = sharedIds.map((id) => studentMap.get(id)?.name || id);
        conflictEdges.push({
          sourceId: s1.id,
          targetId: s2.id,
          sharedStudentIds: sharedIds,
          sharedStudentNames: sharedNames,
          conflictCount: sharedIds.length,
        });

        adjacencyList.get(s1.id)?.add(s2.id);
        adjacencyList.get(s2.id)?.add(s1.id);
      }
    }
  }

  return { conflictEdges, adjacencyList, studentMap };
}

/**
 * Executes Graph Coloring using Greedy Algorithm with Welsh-Powell degree ordering.
 * 1. Vertices sorted by degree descending
 * 2. Assigned lowest non-conflicting color
 */
export function executeGreedyColoring(
  subjects: Subject[],
  adjacencyList: Map<string, Set<string>>
): GraphColoringResult {
  const vertexColors: Record<string, number> = {};
  const steps: AlgorithmStep[] = [];
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  // Calculate degrees
  const vertexDegrees = subjects.map((s) => ({
    subject: s,
    degree: adjacencyList.get(s.id)?.size || 0,
  }));

  // Welsh-Powell: sort by degree descending
  vertexDegrees.sort((a, b) => b.degree - a.degree);

  let maxDegree = 0;
  if (vertexDegrees.length > 0) {
    maxDegree = vertexDegrees[0].degree;
  }

  vertexDegrees.forEach((item, index) => {
    const { subject, degree } = item;
    const neighbors = adjacencyList.get(subject.id) || new Set();

    // Find colors already taken by colored neighbors
    const takenColors = new Set<number>();
    const conflictingNeighborCodes: string[] = [];

    neighbors.forEach((neighborId) => {
      if (vertexColors[neighborId] !== undefined) {
        const neighborColor = vertexColors[neighborId];
        takenColors.add(neighborColor);
        const neighborSubject = subjectMap.get(neighborId);
        if (neighborSubject) {
          conflictingNeighborCodes.push(
            `${neighborSubject.code} (Slot ${neighborColor + 1})`
          );
        }
      }
    });

    // Pick smallest non-negative integer color not in takenColors
    let assignedColor = 0;
    while (takenColors.has(assignedColor)) {
      assignedColor++;
    }

    vertexColors[subject.id] = assignedColor;

    const explanation =
      conflictingNeighborCodes.length > 0
        ? `Conflict with ${conflictingNeighborCodes.join(', ')}. Assigned lowest available Time Slot ${assignedColor + 1}.`
        : `No conflicting neighbors colored yet. Assigned Time Slot ${assignedColor + 1} (Color ${assignedColor}).`;

    steps.push({
      step: index + 1,
      vertexId: subject.id,
      vertexCode: subject.code,
      degree,
      assignedColor,
      slotName: `Slot ${assignedColor + 1}`,
      explanation,
    });
  });

  const totalColorsUsed =
    Object.keys(vertexColors).length === 0
      ? 0
      : Math.max(...Object.values(vertexColors)) + 1;

  const colorToSlotMap = buildColorToSlotMap(totalColorsUsed);

  return {
    algorithmUsed: 'GREEDY',
    vertexColors,
    colorToSlotMap,
    totalColorsUsed,
    maxDegree,
    conflictEdges: [],
    algorithmSteps: steps,
    isOptimalKnown: false,
  };
}

/**
 * Executes DSATUR (Degree of Saturation) Graph Coloring.
 * In each step:
 * 1. Compute saturation degree of uncolored vertices (count of distinct colors in neighbors).
 * 2. Select vertex with maximum saturation degree (tie-break with max uncolored degree, then total degree).
 * 3. Color vertex with lowest available color.
 */
export function executeDSATURColoring(
  subjects: Subject[],
  adjacencyList: Map<string, Set<string>>
): GraphColoringResult {
  const vertexColors: Record<string, number> = {};
  const steps: AlgorithmStep[] = [];
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  const uncolored = new Set(subjects.map((s) => s.id));
  const totalVertices = subjects.length;

  let maxDegree = 0;
  subjects.forEach((s) => {
    const deg = adjacencyList.get(s.id)?.size || 0;
    if (deg > maxDegree) maxDegree = deg;
  });

  let stepNumber = 1;

  while (uncolored.size > 0) {
    let bestVertexId: string | null = null;
    let maxSatDegree = -1;
    let maxUncoloredDegree = -1;
    let maxTotalDegree = -1;

    // Evaluate each uncolored candidate
    uncolored.forEach((vId) => {
      const neighbors = adjacencyList.get(vId) || new Set();

      // Saturation degree = number of DISTINCT colors among colored neighbors
      const neighborColors = new Set<number>();
      let uncoloredNeighborCount = 0;

      neighbors.forEach((nId) => {
        if (vertexColors[nId] !== undefined) {
          neighborColors.add(vertexColors[nId]);
        } else {
          uncoloredNeighborCount++;
        }
      });

      const satDegree = neighborColors.size;
      const totalDeg = neighbors.size;

      // Primary: higher saturation degree
      // Secondary: higher uncolored degree
      // Tertiary: higher total degree
      let isBetter = false;
      if (bestVertexId === null) {
        isBetter = true;
      } else if (satDegree > maxSatDegree) {
        isBetter = true;
      } else if (satDegree === maxSatDegree) {
        if (uncoloredNeighborCount > maxUncoloredDegree) {
          isBetter = true;
        } else if (uncoloredNeighborCount === maxUncoloredDegree) {
          if (totalDeg > maxTotalDegree) {
            isBetter = true;
          }
        }
      }

      if (isBetter) {
        bestVertexId = vId;
        maxSatDegree = satDegree;
        maxUncoloredDegree = uncoloredNeighborCount;
        maxTotalDegree = totalDeg;
      }
    });

    if (!bestVertexId) break;

    const chosenSubject = subjectMap.get(bestVertexId)!;
    const neighbors = adjacencyList.get(bestVertexId) || new Set();

    const takenColors = new Set<number>();
    const conflictingNeighborCodes: string[] = [];

    neighbors.forEach((nId) => {
      if (vertexColors[nId] !== undefined) {
        const c = vertexColors[nId];
        takenColors.add(c);
        const nSubject = subjectMap.get(nId);
        if (nSubject) {
          conflictingNeighborCodes.push(`${nSubject.code} (Slot ${c + 1})`);
        }
      }
    });

    let assignedColor = 0;
    while (takenColors.has(assignedColor)) {
      assignedColor++;
    }

    vertexColors[bestVertexId] = assignedColor;
    uncolored.delete(bestVertexId);

    const explanation =
      conflictingNeighborCodes.length > 0
        ? `Max saturation degree ${maxSatDegree} (clashes with ${conflictingNeighborCodes.join(', ')}). Assigned lowest available Slot ${assignedColor + 1}.`
        : `Highest degree vertex (${maxTotalDegree} neighbors). Assigned Time Slot ${assignedColor + 1} (Color ${assignedColor}).`;

    steps.push({
      step: stepNumber++,
      vertexId: bestVertexId,
      vertexCode: chosenSubject.code,
      degree: maxTotalDegree,
      saturationDegree: maxSatDegree,
      assignedColor,
      slotName: `Slot ${assignedColor + 1}`,
      explanation,
    });
  }

  const totalColorsUsed =
    Object.keys(vertexColors).length === 0
      ? 0
      : Math.max(...Object.values(vertexColors)) + 1;

  const colorToSlotMap = buildColorToSlotMap(totalColorsUsed);

  return {
    algorithmUsed: 'DSATUR',
    vertexColors,
    colorToSlotMap,
    totalColorsUsed,
    maxDegree,
    conflictEdges: [],
    algorithmSteps: steps,
    isOptimalKnown: totalColorsUsed <= 2 || totalColorsUsed === maxDegree + 1,
  };
}

/**
 * Creates mapping from integer color index to TimeSlotConfig
 */
export function buildColorToSlotMap(totalColors: number): Record<number, TimeSlotConfig> {
  const map: Record<number, TimeSlotConfig> = {};
  for (let c = 0; c < Math.max(totalColors, 1); c++) {
    const template =
      c < DEFAULT_TIME_SLOTS.length
        ? DEFAULT_TIME_SLOTS[c]
        : {
            slotIndex: c,
            name: `Slot ${c + 1} (Period ${c + 1})`,
            startTime: '09:30',
            endTime: '12:30',
          };

    map[c] = {
      ...template,
      slotIndex: c,
      colorHex: SLOT_PALETTE[c % SLOT_PALETTE.length],
    };
  }
  return map;
}
