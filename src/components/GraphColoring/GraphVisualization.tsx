import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Subject, ConflictEdge, GraphColoringResult } from '../../types';
import { Info, ZoomIn, ZoomOut, RotateCcw, AlertTriangle, Users } from 'lucide-react';

interface GraphVisualizationProps {
  subjects: Subject[];
  conflictEdges: ConflictEdge[];
  coloringResult: GraphColoringResult | null;
  onSelectSubject?: (subjectId: string) => void;
}

interface NodePosition {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
}

export const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  subjects,
  conflictEdges,
  coloringResult,
  onSelectSubject,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<ConflictEdge | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, NodePosition>>({});
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [animatedStepIndex, setAnimatedStepIndex] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Animate coloring progression
  const triggerColoringAnimation = () => {
    if (!coloringResult || coloringResult.algorithmSteps.length === 0 || isSimulating) return;
    setIsSimulating(true);
    setAnimatedStepIndex(0);

    const steps = coloringResult.algorithmSteps;
    steps.forEach((step, idx) => {
      setTimeout(() => {
        setSelectedNodeId(step.vertexId);
        setAnimatedStepIndex(idx);
        if (idx === steps.length - 1) {
          setTimeout(() => setIsSimulating(false), 800);
        }
      }, (idx + 1) * 600);
    });
  };

  // Initialize circular layout for nodes
  useEffect(() => {
    if (subjects.length === 0) return;
    const width = 600;
    const height = 440;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 70;

    const initialPos: Record<string, NodePosition> = {};
    const n = subjects.length;

    subjects.forEach((sub, i) => {
      // Circular distribution
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      initialPos[sub.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    setNodePositions(initialPos);
  }, [subjects]);

  // Dragging support
  const handleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingNodeId(nodeId);
    setSelectedNodeId(nodeId);
    if (onSelectSubject) onSelectSubject(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;

    setNodePositions((prev) => ({
      ...prev,
      [draggingNodeId]: { x, y },
    }));
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  // Find neighbor conflicts for selected node
  const selectedNodeDetails = useMemo(() => {
    if (!selectedNodeId) return null;
    const sub = subjects.find((s) => s.id === selectedNodeId);
    if (!sub) return null;

    const incidentEdges = conflictEdges.filter(
      (e) => e.sourceId === selectedNodeId || e.targetId === selectedNodeId
    );

    const conflictingNeighborIds = new Set(
      incidentEdges.map((e) => (e.sourceId === selectedNodeId ? e.targetId : e.sourceId))
    );

    const conflictingSubjects = subjects.filter((s) => conflictingNeighborIds.has(s.id));

    return {
      subject: sub,
      incidentEdges,
      conflictingSubjects,
      colorIndex: coloringResult?.vertexColors[selectedNodeId] ?? 0,
      slotName: coloringResult?.colorToSlotMap[coloringResult.vertexColors[selectedNodeId]]?.name || 'Slot',
    };
  }, [selectedNodeId, subjects, conflictEdges, coloringResult]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col xl:flex-row gap-6">
      {/* Left / Main SVG Visualizer */}
      <div className="flex-1 flex flex-col">
        {/* Controls Bar */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <span>Examination Conflict Graph</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-[#EAF4FF] text-[#438DFF] font-semibold">
                G = (V, E)
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Nodes = Examinations • Edges = Shared Students • Node Colors = Assigned Time Slots
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerColoringAnimation}
              disabled={isSimulating}
              className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#438DFF] to-[#A78BFA] hover:opacity-90 rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <span>{isSimulating ? 'Animating Algorithm...' : '▶ Play Coloring Trace'}</span>
            </button>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.8))}
                className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.6))}
                className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setZoomLevel(1);
                  setSelectedNodeId(null);
                }}
                className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition"
                title="Reset Layout & Selection"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Graph Canvas */}
        <div
          className="relative bg-slate-50/60 rounded-xl border border-slate-200/80 overflow-hidden flex items-center justify-center select-none"
          style={{ height: '460px' }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <svg
            ref={svgRef}
            viewBox="0 0 600 440"
            className="w-full h-full cursor-grab active:cursor-grabbing"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
            onClick={() => setSelectedNodeId(null)}
          >
            <defs>
              <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
              </filter>
            </defs>

            {/* Conflict Edges */}
            {conflictEdges.map((edge) => {
              const p1 = nodePositions[edge.sourceId];
              const p2 = nodePositions[edge.targetId];
              if (!p1 || !p2) return null;

              const isConnectedToSelected =
                selectedNodeId === edge.sourceId || selectedNodeId === edge.targetId;
              const isDimmed = selectedNodeId !== null && !isConnectedToSelected;

              const midX = (p1.x + p2.x) / 2;
              const midY = (p1.y + p2.y) / 2;

              return (
                <g
                  key={`${edge.sourceId}-${edge.targetId}`}
                  onMouseEnter={() => setHoveredEdge(edge)}
                  onMouseLeave={() => setHoveredEdge(null)}
                >
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={
                      isConnectedToSelected
                        ? '#EF4444'
                        : isDimmed
                        ? '#CBD5E1'
                        : '#94A3B8'
                    }
                    strokeWidth={isConnectedToSelected ? 2.5 : 1.5}
                    strokeDasharray={isConnectedToSelected ? 'none' : '4,3'}
                    opacity={isDimmed ? 0.3 : 0.8}
                    className="transition-colors"
                  />
                  {/* Badge showing shared student count */}
                  <circle
                    cx={midX}
                    cy={midY}
                    r={9}
                    fill={isConnectedToSelected ? '#FEE2E2' : '#F1F5F9'}
                    stroke={isConnectedToSelected ? '#EF4444' : '#CBD5E1'}
                    strokeWidth={1}
                  />
                  <text
                    x={midX}
                    y={midY + 3.5}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="bold"
                    fill={isConnectedToSelected ? '#991B1B' : '#475569'}
                  >
                    {edge.conflictCount}
                  </text>
                </g>
              );
            })}

            {/* Vertices (Nodes) */}
            {subjects.map((sub) => {
              const pos = nodePositions[sub.id];
              if (!pos) return null;

              const colorIndex = coloringResult?.vertexColors[sub.id] ?? 0;
              const colorHex =
                coloringResult?.colorToSlotMap[colorIndex]?.colorHex || '#438DFF';
              const isSelected = selectedNodeId === sub.id;

              return (
                <g
                  key={sub.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onMouseDown={(e) => handleMouseDown(sub.id, e)}
                  className="cursor-pointer transition-transform"
                >
                  {/* Selection Ring */}
                  {isSelected && (
                    <circle
                      r={30}
                      fill="none"
                      stroke="#438DFF"
                      strokeWidth={3}
                      strokeDasharray="4,2"
                      className="animate-spin-slow"
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    r={24}
                    fill={colorHex}
                    filter="url(#nodeShadow)"
                    stroke="#FFFFFF"
                    strokeWidth={2.5}
                  />

                  {/* Subject Code */}
                  <text
                    y={-2}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="10"
                    fontWeight="800"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                  >
                    {sub.code}
                  </text>

                  {/* Slot Number Label */}
                  <text
                    y={10}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="8.5"
                    fontWeight="600"
                    opacity="0.9"
                  >
                    Slot {colorIndex + 1}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hovered Edge Tooltip */}
          {hoveredEdge && (
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm border border-slate-200 px-3 py-2 rounded-xl shadow-md text-xs text-slate-700 pointer-events-none">
              <span className="font-bold text-rose-600 block">
                Conflict: {hoveredEdge.conflictCount} Shared Student(s)
              </span>
              <span className="text-[11px] text-slate-500">
                {hoveredEdge.sharedStudentNames.slice(0, 3).join(', ')}
                {hoveredEdge.sharedStudentNames.length > 3 && ` +${hoveredEdge.sharedStudentNames.length - 3} more`}
              </span>
            </div>
          )}

          {/* Drag instruction notice */}
          <div className="absolute top-2 left-2 text-[10px] text-slate-400 bg-white/80 px-2 py-0.5 rounded-md pointer-events-none">
            💡 Click any examination node to inspect conflicts • Drag to reposition
          </div>
        </div>

        {/* Color Legend for Time Slots */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-500 text-[11px] uppercase mr-1">
            Time Slot Palette:
          </span>
          {coloringResult &&
            Object.values(coloringResult.colorToSlotMap).map((slot) => (
              <div
                key={slot.slotIndex}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700"
              >
                <span
                  className="w-3 h-3 rounded-full border border-white shadow-xs"
                  style={{ backgroundColor: slot.colorHex }}
                />
                <span className="font-semibold text-xs">{slot.name.split(':')[0]}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Right: Selected Node / Conflict Inspection Panel */}
      <div className="w-full xl:w-80 flex flex-col justify-between border-t xl:border-t-0 xl:border-l border-slate-200 pt-5 xl:pt-0 xl:pl-6">
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Selected Examination Inspector
          </h4>

          {selectedNodeDetails ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{
                      backgroundColor:
                        coloringResult?.colorToSlotMap[selectedNodeDetails.colorIndex]?.colorHex ||
                        '#438DFF',
                    }}
                  />
                  <h5 className="font-extrabold text-base text-[#0F172A]">
                    {selectedNodeDetails.subject.code}
                  </h5>
                  <span className="ml-auto text-xs font-bold text-[#438DFF] bg-[#EAF4FF] px-2 py-0.5 rounded-full">
                    {selectedNodeDetails.slotName.split(':')[0]}
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-medium">{selectedNodeDetails.subject.name}</div>
                <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-3">
                  <span>Enrolled: <strong>{selectedNodeDetails.subject.enrolledStudentIds.length}</strong></span>
                  <span>Duration: <strong>{selectedNodeDetails.subject.durationMinutes}m</strong></span>
                </div>
              </div>

              {/* Clashing Neighbors */}
              <div>
                <h6 className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                  <span>Clashing Subjects ({selectedNodeDetails.conflictingSubjects.length})</span>
                  <span className="text-[10px] text-rose-600 font-semibold">Different Slots Required</span>
                </h6>

                {selectedNodeDetails.conflictingSubjects.length === 0 ? (
                  <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                    ✨ No conflicts! This examination shares zero students with any other subject and can be scheduled in any time slot.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {selectedNodeDetails.conflictingSubjects.map((conflictSub) => {
                      const edge = selectedNodeDetails.incidentEdges.find(
                        (e) => e.sourceId === conflictSub.id || e.targetId === conflictSub.id
                      );
                      const neighborColor = coloringResult?.vertexColors[conflictSub.id] ?? 0;
                      const neighborColorHex = coloringResult?.colorToSlotMap[neighborColor]?.colorHex || '#A78BFA';

                      return (
                        <div
                          key={conflictSub.id}
                          className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs flex items-center justify-between hover:border-slate-300 transition"
                        >
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-[#0F172A]">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: neighborColorHex }}
                              />
                              <span>{conflictSub.code}</span>
                              <span className="text-[10px] font-normal text-slate-400">
                                (Slot {neighborColor + 1})
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 line-clamp-1">
                              {conflictSub.name}
                            </div>
                          </div>

                          <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200 whitespace-nowrap">
                            {edge?.conflictCount} shared
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No Examination Selected</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Click any colored circle on the conflict graph to inspect its mathematical degree and clashing student enrollments.
              </p>
            </div>
          )}
        </div>

        {/* Discrete Math Property Footnote */}
        <div className="mt-4 p-3 bg-purple-50/70 border border-[#A78BFA]/30 rounded-xl text-xs text-slate-700">
          <strong className="text-[#6D28D9] block mb-1 font-bold">Discrete Mathematics Fact:</strong>
          In graph coloring, adjacent vertices $u, v \in V$ must satisfy $c(u) \neq c(v)$. Thus, no two examinations sharing a student are ever assigned to the same time slot!
        </div>
      </div>
    </div>
  );
};
