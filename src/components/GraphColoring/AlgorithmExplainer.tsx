import React from 'react';
import { useApp } from '../../context/AppContext';
import { Brain, Cpu, BookOpen, CheckCircle, Info, Sparkles } from 'lucide-react';

export const AlgorithmExplainer: React.FC = () => {
  const {
    algorithmPreference,
    setAlgorithmPreference,
    coloringResult,
    conflictEdges,
    subjects,
    generateTimetable,
    showToast,
  } = useApp();

  const handleSwitchAlgorithm = (algo: 'GREEDY' | 'DSATUR') => {
    setAlgorithmPreference(algo);
    generateTimetable(algo);
    showToast(`Switched graph coloring algorithm to ${algo}`, 'success');
  };

  const steps = coloringResult?.algorithmSteps || [];
  const maxDegree = coloringResult?.maxDegree || 0;
  const colorsUsed = coloringResult?.totalColorsUsed || 0;

  return (
    <div className="space-y-6">
      {/* Algorithm Selector Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-50 text-[#7C3AED]">
                <Brain className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-[#0F172A]">
                  Graph Coloring Algorithm Selection & Mathematical Trace
                </h3>
                <p className="text-xs text-slate-500">
                  Select between Welsh-Powell Greedy Ordering and Daniel Brélaz's DSATUR algorithm
                </p>
              </div>
            </div>
          </div>

          {/* Toggle buttons */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => handleSwitchAlgorithm('GREEDY')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                algorithmPreference === 'GREEDY'
                  ? 'bg-white text-[#438DFF] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Welsh-Powell Greedy</span>
            </button>
            <button
              onClick={() => handleSwitchAlgorithm('DSATUR')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                algorithmPreference === 'DSATUR'
                  ? 'bg-white text-[#7C3AED] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>DSATUR (Degree of Saturation)</span>
            </button>
          </div>
        </div>

        {/* Theoretical Bounds Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Vertices |V|</span>
            <span className="text-xl font-extrabold text-[#0F172A]">{subjects.length} exams</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Conflict Edges |E|</span>
            <span className="text-xl font-extrabold text-amber-600">{conflictEdges.length} clashes</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Max Vertex Degree Δ(G)</span>
            <span className="text-xl font-extrabold text-[#0F172A]">{maxDegree}</span>
          </div>
          <div className="p-3 bg-purple-50/70 border border-[#A78BFA]/30 rounded-xl">
            <span className="text-[10px] font-bold text-[#7C3AED] uppercase block">Time Slots Used k = χ(G)</span>
            <span className="text-xl font-extrabold text-[#6D28D9]">{colorsUsed} slots</span>
          </div>
        </div>

        {/* Algorithm description */}
        <div className="mt-4 p-3.5 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200/80 leading-relaxed">
          {algorithmPreference === 'GREEDY' ? (
            <p>
              <strong className="text-[#0F172A]">Welsh-Powell Greedy Coloring:</strong> Arranges the examinations in descending order of degree $d(v_1) \ge d(v_2) \ge \dots \ge d(v_n)$ (examinations with the most student clashes first). It iteratively assigns each examination the smallest available time slot not already taken by its colored neighbors.
            </p>
          ) : (
            <p>
              <strong className="text-[#0F172A]">DSATUR (Brélaz 1979):</strong> Dynamically selects the uncolored examination with the highest <em>Degree of Saturation</em> $\rho(v)$ (number of distinct colors among already colored neighbors). Ties are broken by highest remaining degree in the uncolored subgraph. DSATUR frequently achieves the exact optimal chromatic number $\chi(G)$.
            </p>
          )}
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>
              <strong>Note on Optimality:</strong> Graph vertex coloring is NP-complete. Welsh-Powell and DSATUR are proven polynomial-time heuristics that guarantee zero conflicts and near-optimal time slots.
            </span>
          </div>
        </div>
      </div>

      {/* Step-by-Step Execution Trace Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-[#0F172A]">
              Step-by-Step Algorithm Execution Trace ({algorithmPreference})
            </h4>
            <p className="text-xs text-slate-500">
              Deterministic log explaining why each examination was assigned to its specific time slot
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {steps.length} Steps Completed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3 text-center">Step #</th>
                <th className="py-2.5 px-3">Examination Code</th>
                <th className="py-2.5 px-3 text-center">Total Degree d(v)</th>
                {algorithmPreference === 'DSATUR' && (
                  <th className="py-2.5 px-3 text-center">Saturation ρ(v)</th>
                )}
                <th className="py-2.5 px-3 text-center">Assigned Color & Slot</th>
                <th className="py-2.5 px-3">Discrete Mathematics Decision Logic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {steps.map((st) => (
                <tr key={st.step} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 text-center font-bold text-slate-400">
                    #{st.step}
                  </td>
                  <td className="py-3 px-3 font-bold text-[#0F172A]">
                    {st.vertexCode}
                  </td>
                  <td className="py-3 px-3 text-center font-semibold text-slate-700">
                    {st.degree}
                  </td>
                  {algorithmPreference === 'DSATUR' && (
                    <td className="py-3 px-3 text-center font-bold text-[#7C3AED]">
                      {st.saturationDegree ?? 0}
                    </td>
                  )}
                  <td className="py-3 px-3 text-center">
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-white font-bold text-[11px] shadow-xs"
                      style={{
                        backgroundColor:
                          coloringResult?.colorToSlotMap[st.assignedColor]?.colorHex || '#438DFF',
                      }}
                    >
                      Color {st.assignedColor} ({st.slotName})
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 text-xs">
                    {st.explanation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
