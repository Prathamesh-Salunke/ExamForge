export interface Subject {
  id: string;
  code: string;
  name: string;
  department: string;
  semester: number;
  durationMinutes: number; // e.g. 120
  enrolledStudentIds: string[];
}

export interface Student {
  id: string; // e.g. "STU-1001"
  rollNo: string;
  name: string;
  email: string;
  department: string;
  semester: number;
}

export interface Classroom {
  id: string;
  name: string; // e.g. "Hall 101"
  building: string; // e.g. "Main Academic Block"
  floor: number;
  capacity: number; // e.g. 60
  isActive: boolean;
  isLab: boolean;
}

export interface TimeSlotConfig {
  slotIndex: number; // 0, 1, 2...
  name: string; // e.g. "Slot 1 (Morning)"
  startTime: string; // "09:30"
  endTime: string; // "12:30"
  colorHex: string; // Associated color for graph visualization
}

export interface ScheduledExam {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "09:30"
  endTime: string; // "12:30"
  timeSlotIndex: number; // Graph coloring slot
  colorHex: string;
  assignedRoomIds: string[]; // Supports single or multiple rooms
  assignedRoomNames: string[];
  totalStudents: number;
  totalCapacityProvided: number;
}

export interface ConflictEdge {
  sourceId: string;
  targetId: string;
  sharedStudentIds: string[];
  sharedStudentNames: string[];
  conflictCount: number;
}

export interface AlgorithmStep {
  step: number;
  vertexId: string;
  vertexCode: string;
  degree: number;
  saturationDegree?: number;
  assignedColor: number;
  slotName: string;
  explanation: string;
}

export interface GraphColoringResult {
  algorithmUsed: 'GREEDY' | 'DSATUR';
  vertexColors: Record<string, number>; // subjectId -> colorIndex (0-based)
  colorToSlotMap: Record<number, TimeSlotConfig>;
  totalColorsUsed: number;
  maxDegree: number;
  conflictEdges: ConflictEdge[];
  algorithmSteps: AlgorithmStep[];
  isOptimalKnown: boolean;
}

export interface ValidationIssue {
  type: 'STUDENT_CONFLICT' | 'ROOM_DOUBLE_BOOKED' | 'CAPACITY_DEFICIT' | 'ROOM_INACTIVE';
  severity: 'ERROR' | 'WARNING';
  message: string;
  subjectCodes?: string[];
  roomName?: string;
}

export interface RoomVacancyStatus {
  classroom: Classroom;
  isAvailable: boolean; // Not booked during the target interval
  isCapacitySufficient: boolean; // capacity >= requiredStudents
  isSuitable: boolean; // isAvailable && isCapacitySufficient && isActive
  remainingSeats: number;
  conflictingExam?: {
    subjectCode: string;
    subjectName: string;
    date: string;
    startTime: string;
    endTime: string;
  };
  unsuitabilityReason?: string;
}

export interface TimetableMetadata {
  academicYear: string;
  semesterName: string;
  generatedAt: string;
  algorithm: 'GREEDY' | 'DSATUR';
  totalExams: number;
  totalRoomsUsed: number;
  isValid: boolean;
  status: 'DRAFT' | 'SAVED';
}
