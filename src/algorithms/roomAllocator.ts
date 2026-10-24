import { Classroom, ScheduledExam, RoomVacancyStatus, Subject } from '../types';

/**
 * Converts "HH:MM" (24-hour format) to total minutes from midnight.
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Checks if two time intervals on the same date overlap.
 * Uses half-open interval rule: [start1, end1) and [start2, end2) overlap iff
 * start1 < end2 AND end1 > start2.
 */
export function doIntervalsOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  return s1 < e2 && e1 > s2;
}

/**
 * Evaluates the vacancy and suitability of all classrooms for a specified date and time window.
 */
export function findVacantClassrooms(
  classrooms: Classroom[],
  scheduledExams: ScheduledExam[],
  targetDate: string,
  targetStartTime: string,
  targetEndTime: string,
  requiredCapacity: number = 1
): RoomVacancyStatus[] {
  return classrooms.map((room) => {
    // Check if classroom is allocated to any exam during this overlapping interval
    let conflictingExam: ScheduledExam | undefined;

    for (const exam of scheduledExams) {
      if (exam.date === targetDate && exam.assignedRoomIds.includes(room.id)) {
        if (doIntervalsOverlap(targetStartTime, targetEndTime, exam.startTime, exam.endTime)) {
          conflictingExam = exam;
          break;
        }
      }
    }

    if (conflictingExam) {
      return {
        classroom: room,
        isAvailable: false,
        isCapacitySufficient: room.capacity >= requiredCapacity,
        isSuitable: false,
        remainingSeats: 0,
        conflictingExam: {
          subjectCode: conflictingExam.subjectCode,
          subjectName: conflictingExam.subjectName,
          date: conflictingExam.date,
          startTime: conflictingExam.startTime,
          endTime: conflictingExam.endTime,
        },
        unsuitabilityReason: `Occupied by ${conflictingExam.subjectCode} (${conflictingExam.startTime} - ${conflictingExam.endTime})`,
      };
    }

    // Room is not occupied
    const isAvailable = true;
    const isCapacitySufficient = room.capacity >= requiredCapacity;
    const isSuitable = isAvailable && isCapacitySufficient && room.isActive;
    const remainingSeats = isCapacitySufficient ? room.capacity - requiredCapacity : 0;

    let unsuitabilityReason: string | undefined;
    if (!room.isActive) {
      unsuitabilityReason = 'Classroom is currently marked inactive for maintenance';
    } else if (!isCapacitySufficient) {
      unsuitabilityReason = `Insufficient capacity: Room has ${room.capacity} seats (${requiredCapacity - room.capacity} short)`;
    }

    return {
      classroom: room,
      isAvailable,
      isCapacitySufficient,
      isSuitable,
      remainingSeats,
      unsuitabilityReason,
    };
  });
}

export interface AllocationAttemptResult {
  assignedRoomIds: string[];
  assignedRoomNames: string[];
  totalCapacityProvided: number;
  isFullySeated: boolean;
  failureReason?: string;
}

/**
 * Allocates rooms for an examination given the available rooms in that slot.
 * Tries single room best-fit first, then multi-room if necessary and enabled.
 */
export function allocateRoomsForExam(
  subject: Subject,
  availableRooms: Classroom[],
  allowMultiRoom: boolean = true
): AllocationAttemptResult {
  const studentsCount = Math.max(subject.enrolledStudentIds.length, 1);
  const activeRooms = availableRooms.filter((r) => r.isActive);

  // 1. Try single room best-fit (minimal wasted seats)
  const singleRoomCandidates = activeRooms
    .filter((r) => r.capacity >= studentsCount)
    .sort((a, b) => a.capacity - b.capacity);

  if (singleRoomCandidates.length > 0) {
    const chosen = singleRoomCandidates[0];
    return {
      assignedRoomIds: [chosen.id],
      assignedRoomNames: [chosen.name],
      totalCapacityProvided: chosen.capacity,
      isFullySeated: true,
    };
  }

  // 2. If single room is not large enough, try multi-room allocation if allowed
  if (allowMultiRoom && activeRooms.length > 1) {
    // Sort descending by capacity to minimize number of rooms needed
    const sortedRooms = [...activeRooms].sort((a, b) => b.capacity - a.capacity);
    const selectedRooms: Classroom[] = [];
    let currentCapacity = 0;

    for (const r of sortedRooms) {
      selectedRooms.push(r);
      currentCapacity += r.capacity;
      if (currentCapacity >= studentsCount) {
        return {
          assignedRoomIds: selectedRooms.map((r) => r.id),
          assignedRoomNames: selectedRooms.map((r) => r.name),
          totalCapacityProvided: currentCapacity,
          isFullySeated: true,
        };
      }
    }
  }

  // 3. Fallback: Allocation failed
  return {
    assignedRoomIds: [],
    assignedRoomNames: [],
    totalCapacityProvided: 0,
    isFullySeated: false,
    failureReason: `No combination of vacant active rooms has enough seating for ${studentsCount} students (Available capacity: ${activeRooms.reduce((sum, r) => sum + r.capacity, 0)})`,
  };
}
