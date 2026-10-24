import React from 'react';
import {
  BookOpen,
  Building2,
  CalendarCheck,
  AlertTriangle,
  DoorOpen,
  DoorClosed,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StatCards: React.FC<{
  onNavigateToVacant: () => void;
  onNavigateToGenerator: () => void;
  onNavigateToGraph: () => void;
}> = ({ onNavigateToVacant, onNavigateToGenerator, onNavigateToGraph }) => {
  const { subjects, classrooms, scheduledExams, conflictEdges } = useApp();

  const totalRooms = classrooms.length;
  const activeRooms = classrooms.filter((r) => r.isActive).length;

  // Calculate unique rooms currently occupied in scheduled exams
  const occupiedRoomIds = new Set<string>();
  scheduledExams.forEach((exam) => {
    exam.assignedRoomIds.forEach((id) => occupiedRoomIds.add(id));
  });

  const occupiedCount = occupiedRoomIds.size;
  const vacantActiveCount = Math.max(activeRooms - occupiedCount, 0);

  const stats = [
    {
      title: 'Total Subjects',
      value: subjects.length,
      subtitle: `${subjects.reduce((acc, s) => acc + s.enrolledStudentIds.length, 0)} total enrollments`,
      icon: <BookOpen className="w-5 h-5 text-[#438DFF]" />,
      bg: 'bg-[#EAF4FF]',
      borderColor: 'border-[#438DFF]/20',
      action: null,
    },
    {
      title: 'Classrooms',
      value: totalRooms,
      subtitle: `${activeRooms} active (${classrooms.filter((r) => !r.isActive).length} maintenance)`,
      icon: <Building2 className="w-5 h-5 text-[#A78BFA]" />,
      bg: 'bg-[#F5F3FF]',
      borderColor: 'border-[#A78BFA]/30',
      action: null,
    },
    {
      title: 'Occupied Rooms',
      value: occupiedCount,
      subtitle: 'Rooms currently holding scheduled exams',
      icon: <DoorClosed className="w-5 h-5 text-indigo-500" />,
      bg: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      action: null,
    },
    {
      title: 'Vacant Active Rooms',
      value: vacantActiveCount,
      subtitle: 'Available for immediate exam allocation',
      icon: <DoorOpen className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      badge: 'Available',
      action: {
        label: 'Find Vacant',
        onClick: onNavigateToVacant,
      },
    },
    {
      title: 'Scheduled Exams',
      value: scheduledExams.length,
      subtitle: `${scheduledExams.length}/${subjects.length} examinations scheduled`,
      icon: <CalendarCheck className="w-5 h-5 text-[#438DFF]" />,
      bg: 'bg-[#EAF4FF]',
      borderColor: 'border-[#438DFF]/20',
      action: {
        label: 'Generate',
        onClick: onNavigateToGenerator,
      },
    },
    {
      title: 'Student Clashes Detected',
      value: conflictEdges.length,
      subtitle: `${conflictEdges.reduce((acc, e) => acc + e.conflictCount, 0)} student overlap instances`,
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      bg: 'bg-amber-50',
      borderColor: 'border-amber-200',
      badge: 'Graph Edges',
      action: {
        label: 'View Graph',
        onClick: onNavigateToGraph,
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={`bg-white rounded-xl border ${stat.borderColor} p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {stat.title}
              </span>
              <div className={`p-2 rounded-lg ${stat.bg}`}>{stat.icon}</div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#0F172A]">{stat.value}</span>
              {stat.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {stat.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{stat.subtitle}</p>
          </div>

          {stat.action && (
            <button
              onClick={stat.action.onClick}
              className="mt-3 text-xs font-semibold text-[#438DFF] hover:text-[#2563EB] text-left inline-flex items-center gap-1 group"
            >
              <span>{stat.action.label}</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
