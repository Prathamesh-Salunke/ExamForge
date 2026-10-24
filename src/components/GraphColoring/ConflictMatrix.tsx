import React, { useState } from 'react';
import { Subject, ConflictEdge } from '../../types';
import { Users, AlertTriangle, ShieldCheck } from 'lucide-react';

export const ConflictMatrix: React.FC<{
  subjects: Subject[];
  conflictEdges: ConflictEdge[];
}> = ({ subjects, conflictEdges }) => {
  const [selectedPair, setSelectedPair] = useState<ConflictEdge | null>(null);

  // Quick lookup map: "id1-id2" -> ConflictEdge
  const conflictMap = new Map<string, ConflictEdge>();
  conflictEdges.forEach((edge) => {
    conflictMap.set(`${edge.sourceId}-${edge.targetId}`, edge);
    conflictMap.set(`${edge.targetId}-${edge.sourceId}`, edge);
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-[#0F172A]">Student Conflict Adjacency Matrix</h4>
          <p className="text-xs text-slate-500">
            Intersection matrix of all examinations. Red cells denote student clashes requiring separation.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-100 border border-rose-300" />
            <span className="text-slate-600 font-medium">Clash (Shared Students)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200" />
            <span className="text-slate-600 font-medium">Independent (0 clashes)</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center text-xs border-collapse">
          <thead>
            <tr>
              <th className="p-2 border border-slate-200 bg-slate-50 text-slate-400 font-mono text-[10px] text-left">
                EXAM \ EXAM
              </th>
              {subjects.map((s) => (
                <th
                  key={s.id}
                  className="p-2 border border-slate-200 bg-slate-50 font-bold text-[#0F172A] whitespace-nowrap min-w-16"
                >
                  {s.code}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subjects.map((rowSub) => (
              <tr key={rowSub.id}>
                <td className="p-2 border border-slate-200 bg-slate-50 font-bold text-[#0F172A] text-left whitespace-nowrap">
                  {rowSub.code}
                </td>
                {subjects.map((colSub) => {
                  if (rowSub.id === colSub.id) {
                    return (
                      <td
                        key={colSub.id}
                        className="p-2 border border-slate-200 bg-slate-200/60 text-slate-400 font-mono"
                      >
                        —
                      </td>
                    );
                  }

                  const edge = conflictMap.get(`${rowSub.id}-${colSub.id}`);
                  if (edge) {
                    return (
                      <td
                        key={colSub.id}
                        onClick={() => setSelectedPair(edge)}
                        className="p-2 border border-slate-200 bg-rose-50 hover:bg-rose-100 text-rose-800 font-extrabold cursor-pointer transition-colors"
                        title={`Click to view ${edge.conflictCount} shared student(s) between ${rowSub.code} & ${colSub.code}`}
                      >
                        {edge.conflictCount}
                      </td>
                    );
                  }

                  return (
                    <td
                      key={colSub.id}
                      className="p-2 border border-slate-200 bg-white text-slate-300 font-mono"
                    >
                      0
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Pair Shared Students Modal / Card */}
      {selectedPair && (
        <div className="mt-4 p-4 bg-rose-50/80 border border-rose-200 rounded-xl text-xs flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-rose-900 font-bold block mb-1">
                Conflict Details ({selectedPair.conflictCount} shared students):
              </strong>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {selectedPair.sharedStudentNames.map((name, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-white border border-rose-200 rounded-md font-medium text-slate-800 shadow-xs"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedPair(null)}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
