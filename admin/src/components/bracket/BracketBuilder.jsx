import { useState, useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  getBezierPath,
  BaseEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./BracketBuilder.css";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import tournamentService from "@/services/tournamentService";
import matchService from "@/services/matchService";
import { toast } from "sonner";
import {
  Save, Wand2, AlertTriangle, CheckCircle2, Loader2, Link2,
  Unlink, Trophy, Info
} from "lucide-react";

// ─── STATUS COLORS ─────────────────────────────────────────────────────────

const STATUS_BORDER = {
  completed: "oklch(0.5 0.15 160 / 0.5)",
  live: "oklch(0.7 0.18 85 / 0.6)",
  upcoming: "oklch(0.5 0.15 270 / 0.4)",
  unscheduled: "oklch(0.3 0.02 260)",
};

function MatchNodeComponent({ data }) {
  const match = data.match;
  const onLabelChange = data.onLabelChange;
  if (!match) return null;

  const [editing, setEditing] = useState(false);
  const [labelValue, setLabelValue] = useState(match.matchLabel || "");

  // Sync internal label state if match prop changes
  useEffect(() => {
    setLabelValue(match.matchLabel || "");
  }, [match.matchLabel]);

  const teamA = match.teamA;
  const teamB = match.teamB;
  const winnerId = match.result?.winner?._id || match.result?.winner;
  const status = match.status || "unscheduled";

  const handleLabelSave = () => {
    setEditing(false);
    const newLabel = labelValue.trim();
    if (newLabel !== (match.matchLabel || "")) {
      onLabelChange?.(match._id || match.id, newLabel);
    }
  };

  return (
    <div
      className={cn("match-node", status)}
      style={{ borderColor: STATUS_BORDER[status] }}
    >
      {/* Target handles (left side — two inputs) */}
      <Handle type="target" position={Position.Left} id="input-a" style={{ top: "30%", left: -6 }} />
      <Handle type="target" position={Position.Left} id="input-b" style={{ top: "70%", left: -6 }} />

      {/* Source handle (right side — winner output) */}
      <Handle type="source" position={Position.Right} id="output" style={{ top: "50%", right: -6 }} />

      {/* Match label — double-click to edit */}
      <div
        className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider cursor-pointer"
        style={{
          background: "oklch(0.14 0.005 260)",
          border: "1px solid oklch(0.3 0.02 260)",
          color: "oklch(0.6 0 0)",
        }}
        onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
        title="Double-click to edit label"
      >
        {editing ? (
          <input
            className="bg-transparent outline-none text-[9px] font-semibold uppercase tracking-wider w-16 text-center"
            style={{ color: "oklch(0.8 0.15 270)" }}
            value={labelValue}
            onChange={(e) => setLabelValue(e.target.value)}
            onBlur={handleLabelSave}
            onKeyDown={(e) => { if (e.key === "Enter") handleLabelSave(); }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          match.matchLabel || `M${match.matchNumber || "?"}`
        )}
      </div>

      {/* Teams */}
      <div className="flex items-center gap-2 mt-1">
        <TeamChip team={teamA} isWinner={winnerId && String(winnerId) === String(teamA?._id)} />
        <span className="text-[10px] font-bold" style={{ color: "oklch(0.5 0 0)" }}>vs</span>
        <TeamChip team={teamB} isWinner={winnerId && String(winnerId) === String(teamB?._id)} />
      </div>

      {/* Status + date */}
      <div className="flex items-center justify-between mt-1.5">
        <StatusBadge status={status} />
        {match.startTime && (
          <span className="text-[9px]" style={{ color: "oklch(0.5 0 0)" }}>
            {new Date(match.startTime).toLocaleDateString("en", { month: "short", day: "numeric" })}
          </span>
        )}
      </div>
    </div>
  );
}

function TeamChip({ team, isWinner }) {
  if (!team) {
    return (
      <div className="flex items-center gap-1 opacity-40">
        <div className="w-6 h-6 rounded-full border border-dashed flex items-center justify-center"
          style={{ borderColor: "oklch(0.4 0 0)" }}>
          <span className="text-[8px]" style={{ color: "oklch(0.4 0 0)" }}>?</span>
        </div>
        <span className="text-[10px]" style={{ color: "oklch(0.4 0 0)" }}>TBD</span>
      </div>
    );
  }

  const bg = team.color || "#6366f1";
  return (
    <div className="flex items-center gap-1">
      <div
        className={cn(
          "w-6 h-6 rounded-full border flex items-center justify-center overflow-hidden",
          isWinner && "ring-1 ring-offset-1"
        )}
        style={{
          borderColor: `${bg}60`,
          background: `linear-gradient(135deg, ${bg}15, ${bg}30)`,
          ringColor: isWinner ? "oklch(0.7 0.17 160)" : undefined,
          ringOffsetColor: "oklch(0.14 0.005 260)",
        }}
      >
        {team.logo ? (
          <img src={team.logo} alt={team.name} className="w-5 h-5 rounded-full object-cover" />
        ) : (
          <span className="text-[8px] font-bold" style={{ color: "oklch(0.8 0 0)" }}>
            {team.shortName || team.name?.slice(0, 2)?.toUpperCase()}
          </span>
        )}
      </div>
      <span className={cn("text-[10px] font-medium truncate max-w-[50px]")}
        style={{ color: isWinner ? "oklch(0.7 0.17 160)" : "oklch(0.7 0 0)" }}>
        {team.name}
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    completed: { bg: "oklch(0.7 0.17 160 / 0.15)", text: "oklch(0.7 0.17 160)", label: "Done" },
    live: { bg: "oklch(0.8 0.18 85 / 0.15)", text: "oklch(0.8 0.18 85)", label: "LIVE" },
    upcoming: { bg: "oklch(0.6 0.15 270 / 0.15)", text: "oklch(0.6 0.15 270)", label: "Upcoming" },
    unscheduled: { bg: "oklch(0.3 0 0 / 0.3)", text: "oklch(0.5 0 0)", label: "Unscheduled" },
  };
  const c = colors[status] || colors.unscheduled;
  return (
    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.text }}>
      {c.label}
    </span>
  );
}

// ─── CUSTOM EDGE ───────────────────────────────────────────────────────────

function BracketEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, style }) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const isCompleted = data?.sourceStatus === "completed";
  const isLive = data?.sourceStatus === "live";

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        ...style,
        stroke: isLive
          ? "oklch(0.8 0.18 85)"
          : isCompleted
          ? "oklch(0.7 0.17 160)"
          : "oklch(0.4 0.05 270)",
        strokeWidth: isCompleted || isLive ? 2.5 : 1.5,
        strokeDasharray: !isCompleted && !isLive ? "6 4" : undefined,
      }}
      className={cn(
        isCompleted && "bracket-edge-completed",
        isLive && "bracket-edge-live bracket-edge-flow"
      )}
    />
  );
}

// ─── NODE & EDGE TYPES ─────────────────────────────────────────────────────

const nodeTypes = { matchNode: MatchNodeComponent };
const edgeTypes = { bracketEdge: BracketEdge };

// ─── AUTO-ORGANIZE LAYOUT (DAGRE-LIKE) ─────────────────────────────────────

function autoOrganize(nodes, edges) {
  const NODE_W = 240;
  const NODE_H = 90;
  const H_GAP = 120;
  const V_GAP = 30;

  // Build adjacency
  const reverseAdj = {};
  const forwardAdj = {};
  for (const n of nodes) {
    reverseAdj[n.id] = [];
    forwardAdj[n.id] = [];
  }
  for (const e of edges) {
    reverseAdj[e.target].push(e.source);
    forwardAdj[e.source].push(e.target);
  }

  // Calculate rounds (depth)
  const roundMap = {};
  const nodeIds = nodes.map((n) => n.id);
  const leaves = nodeIds.filter((id) => reverseAdj[id].length === 0);
  const isolated = nodeIds.filter((id) => reverseAdj[id].length === 0 && forwardAdj[id].length === 0);

  // Topo sort
  const inDeg = {};
  for (const id of nodeIds) inDeg[id] = reverseAdj[id].length;
  const queue = [...leaves];
  const order = [];
  while (queue.length > 0) {
    const n = queue.shift();
    order.push(n);
    for (const t of forwardAdj[n]) {
      inDeg[t]--;
      if (inDeg[t] === 0) queue.push(t);
    }
  }
  // Add any remaining (isolated)
  for (const id of nodeIds) {
    if (!order.includes(id)) order.push(id);
  }

  for (const leaf of leaves) roundMap[leaf] = 1;
  for (const iso of isolated) roundMap[iso] = 1;

  for (const nodeId of order) {
    const sources = reverseAdj[nodeId];
    if (sources.length > 0) {
      roundMap[nodeId] = Math.max(...sources.map((s) => roundMap[s] || 1)) + 1;
    } else if (!roundMap[nodeId]) {
      roundMap[nodeId] = 1;
    }
  }

  // Group by round
  const roundGroups = {};
  let maxRound = 0;
  for (const [id, r] of Object.entries(roundMap)) {
    if (!roundGroups[r]) roundGroups[r] = [];
    roundGroups[r].push(id);
    if (r > maxRound) maxRound = r;
  }

  // Position nodes
  const newPositions = {};
  for (let round = 1; round <= maxRound; round++) {
    const group = roundGroups[round] || [];
    const x = (round - 1) * (NODE_W + H_GAP);
    const totalHeight = group.length * NODE_H + (group.length - 1) * V_GAP * round;
    const startY = -(totalHeight / 2);

    group.forEach((id, idx) => {
      newPositions[id] = {
        x,
        y: startY + idx * (NODE_H + V_GAP * round),
      };
    });
  }

  return nodes.map((n) => ({
    ...n,
    position: newPositions[n.id] || n.position,
  }));
}

// ─── VALIDATION ────────────────────────────────────────────────────────────

function validateGraph(nodes, edges) {
  const warnings = [];
  const nodeIds = new Set(nodes.map((n) => n.id));

  // Check for unlinked nodes
  const linked = new Set();
  for (const e of edges) {
    linked.add(e.source);
    linked.add(e.target);
  }
  const unlinked = nodes.filter((n) => !linked.has(n.id));
  if (unlinked.length > 0 && edges.length > 0) {
    warnings.push({ type: "warning", msg: `${unlinked.length} unlinked match${unlinked.length > 1 ? "es" : ""}` });
  }

  // Check for final (nodes with no outgoing edge)
  if (edges.length > 0) {
    const hasOutgoing = new Set(edges.map((e) => e.source));
    const finals = [...nodeIds].filter((id) => !hasOutgoing.has(id) && edges.some((e) => e.target === id));
    if (finals.length === 0) {
      warnings.push({ type: "error", msg: "No final match detected" });
    } else if (finals.length > 1) {
      warnings.push({ type: "warning", msg: `${finals.length} disconnected endpoints` });
    }
  }

  // Check for >2 inputs
  const inputCounts = {};
  for (const e of edges) {
    inputCounts[e.target] = (inputCounts[e.target] || 0) + 1;
  }
  for (const [, count] of Object.entries(inputCounts)) {
    if (count > 2) {
      warnings.push({ type: "error", msg: "A match has more than 2 feeders" });
      break;
    }
  }

  if (warnings.length === 0 && edges.length > 0) {
    warnings.push({ type: "valid", msg: "Valid bracket structure" });
  }

  return warnings;
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────

export default function BracketBuilder({ tournamentId, matches, onRefresh }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [graphLoaded, setGraphLoaded] = useState(false);

  // Handle inline label change on a node
  const handleLabelChange = useCallback(async (matchId, newLabel) => {
    try {
      await matchService.update(matchId, { matchLabel: newLabel || null });
      // Update local node data
      setNodes((nds) => nds.map((n) => {
        if (n.id === matchId) {
          return { ...n, data: { ...n.data, match: { ...n.data.match, matchLabel: newLabel } } };
        }
        return n;
      }));
      toast.success(`Label updated to "${newLabel || "auto"}"`);
    } catch {
      toast.error("Failed to update label");
    }
  }, [setNodes]);

  // Load graph data
  useEffect(() => {
    if (!tournamentId) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await tournamentService.getBracketGraph(tournamentId);
        const data = res.data?.data || res.data;

        if (data?.nodes?.length > 0) {
          // Convert backend nodes to React Flow nodes
          const rfNodes = data.nodes.map((n, idx) => ({
            id: n.id,
            type: "matchNode",
            position: {
              x: n.position?.x ?? (idx % 4) * 300,
              y: n.position?.y ?? Math.floor(idx / 4) * 140,
            },
            data: { match: n.match, onLabelChange: handleLabelChange },
          }));

          const rfEdges = (data.edges || []).map((e) => ({
            id: `${e.source}-${e.target}`,
            source: e.source,
            target: e.target,
            sourceHandle: "output",
            targetHandle: e.slot === "B" ? "input-b" : "input-a",
            type: "bracketEdge",
            data: {
              sourceStatus: data.nodes.find((n) => n.id === e.source)?.match?.status || "unscheduled",
            },
          }));

          setNodes(rfNodes);
          setEdges(rfEdges);
          setGraphLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load bracket graph:", err);
        // If bracket-graph API fails, fall back to matches array
        if (matches?.length > 0) {
          const rfNodes = matches.map((m, idx) => ({
            id: m._id || m.id,
            type: "matchNode",
            position: {
              x: (idx % 4) * 300,
              y: Math.floor(idx / 4) * 140,
            },
            data: { match: m, onLabelChange: handleLabelChange },
          }));
          setNodes(rfNodes);
          setGraphLoaded(true);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tournamentId, handleLabelChange]); // Added handleLabelChange to deps

  // Effect to sync nodes with matches prop if it changes (e.g. from table edits)
  useEffect(() => {
    if (graphLoaded && matches?.length > 0) {
      setNodes((nds) => nds.map((node) => {
        const updatedMatch = matches.find((m) => (m._id || m.id) === node.id);
        if (updatedMatch) {
          return { ...node, data: { ...node.data, match: updatedMatch } };
        }
        return node;
      }));
    }
  }, [matches, graphLoaded, setNodes]);

  // Handle new connections
  const onConnect = useCallback(
    (params) => {
      // Validate max 2 inputs per target
      const existingInputs = edges.filter((e) => e.target === params.target);
      if (existingInputs.length >= 2) {
        toast.error("A match can only have 2 feeder matches");
        return;
      }

      // Prevent self-connections
      if (params.source === params.target) {
        toast.error("Cannot connect a match to itself");
        return;
      }

      // Prevent duplicate connections
      if (edges.some((e) => e.source === params.source && e.target === params.target)) {
        toast.error("Connection already exists");
        return;
      }

      // Check for cycles
      const wouldCycle = checkCycle(params.source, params.target, edges);
      if (wouldCycle) {
        toast.error("This connection would create a cycle");
        return;
      }

      const newEdge = {
        ...params,
        id: `${params.source}-${params.target}`,
        type: "bracketEdge",
        data: {
          sourceStatus: nodes.find((n) => n.id === params.source)?.data?.match?.status || "unscheduled",
        },
      };

      setEdges((eds) => addEdge(newEdge, eds));
      toast.success("Match linked!");
    },
    [edges, nodes, setEdges]
  );

  // Cycle detection
  function checkCycle(source, target, currentEdges) {
    // Would adding source->target create a cycle?
    // Check if target can reach source through existing edges
    const visited = new Set();
    const queue = [source];
    while (queue.length > 0) {
      const node = queue.shift();
      if (node === target) return false; // source reaching target is fine — that's the direction
      if (visited.has(node)) continue;
      visited.add(node);
      // Follow edges backwards from node
      for (const e of currentEdges) {
        if (e.target === node) queue.push(e.source);
      }
    }

    // Now check if target can reach source (this would create a cycle)
    const visited2 = new Set();
    const queue2 = [target];
    while (queue2.length > 0) {
      const node = queue2.shift();
      if (node === source) return true; // cycle!
      if (visited2.has(node)) continue;
      visited2.add(node);
      for (const e of currentEdges) {
        if (e.source === node) queue2.push(e.target);
      }
    }
    return false;
  }

  // Edge click to unlink
  const onEdgeClick = useCallback(
    (event, edge) => {
      event.stopPropagation();
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      toast.success("Connection removed");
    },
    [setEdges]
  );

  // Unlink all
  const handleUnlinkAll = useCallback(() => {
    if (edges.length === 0) return;
    setEdges([]);
    toast.success("All connections removed");
  }, [edges, setEdges]);

  // Auto-organize
  const handleAutoOrganize = useCallback(() => {
    setNodes((nds) => autoOrganize(nds, edges));
    toast.success("Layout organized!");
  }, [edges, setNodes]);

  // Save
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const edgesPayload = edges.map((e) => ({
        source: e.source,
        target: e.target,
        slot: e.targetHandle === "input-b" ? "B" : "A",
      }));

      const positionsPayload = nodes.map((n) => ({
        id: n.id,
        x: Math.round(n.position.x),
        y: Math.round(n.position.y),
      }));

      await tournamentService.saveBracketGraph(tournamentId, {
        edges: edgesPayload,
        positions: positionsPayload,
      });

      toast.success("Bracket structure saved!");
      onRefresh?.();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save bracket";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }, [edges, nodes, tournamentId, onRefresh]);

  // Validation
  const validations = useMemo(() => validateGraph(nodes, edges), [nodes, edges]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "oklch(0.6 0.15 270)" }} />
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="text-center py-16">
        <Link2 className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: "oklch(0.5 0 0)" }} />
        <p className="font-medium" style={{ color: "oklch(0.5 0 0)" }}>
          No matches to build a bracket from.
        </p>
        <p className="text-sm mt-1" style={{ color: "oklch(0.4 0 0)" }}>
          Create matches in the Schedule Table tab first.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="bracket-toolbar mb-3">
        <div className="flex items-center gap-1.5 mr-auto">
          <Link2 className="w-4 h-4" style={{ color: "oklch(0.6 0.15 270)" }} />
          <span className="text-xs font-semibold" style={{ color: "oklch(0.7 0 0)" }}>
            Bracket Builder
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full ml-1"
            style={{ background: "oklch(0.6 0.15 270 / 0.15)", color: "oklch(0.6 0.15 270)" }}>
            {nodes.length} matches
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleUnlinkAll}
          disabled={edges.length === 0}
          className="h-7 text-xs gap-1.5 text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500/50"
        >
          <Unlink className="w-3 h-3" /> Unlink All
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleAutoOrganize}
          className="h-7 text-xs gap-1.5"
        >
          <Wand2 className="w-3 h-3" /> Auto-Organize
        </Button>

        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving}
          className="h-7 text-xs gap-1.5 text-white"
          style={{ background: "linear-gradient(135deg, oklch(0.6 0.15 270), oklch(0.5 0.2 300))" }}
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          {saving ? "Saving…" : "Save Structure"}
        </Button>
      </div>

      {/* Canvas */}
      <div className="bracket-builder-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgeClick={onEdgeClick}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          snapToGrid
          snapGrid={[25, 25]}
          connectionLineStyle={{ stroke: "oklch(0.7 0.2 270)", strokeWidth: 2 }}
          defaultEdgeOptions={{ type: "bracketEdge" }}
          deleteKeyCode="Delete"
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant="dots"
            gap={25}
            size={1}
            color="oklch(0.25 0.01 260)"
          />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(n) => {
              const s = n.data?.match?.status;
              if (s === "completed") return "oklch(0.6 0.17 160)";
              if (s === "live") return "oklch(0.8 0.18 85)";
              if (s === "upcoming") return "oklch(0.6 0.15 270)";
              return "oklch(0.35 0 0)";
            }}
            maskColor="oklch(0.1 0 0 / 0.7)"
            pannable
            zoomable
          />
        </ReactFlow>
      </div>

      {/* Validation panel */}
      <AnimatePresence>
        {validations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bracket-validation-panel mt-3"
            style={{ position: "relative", transform: "none", left: "auto", bottom: "auto" }}
          >
            {validations.map((v, i) => (
              <span key={i} className={cn("flex items-center gap-1", v.type)}>
                {v.type === "valid" && <CheckCircle2 className="w-3.5 h-3.5" />}
                {v.type === "warning" && <AlertTriangle className="w-3.5 h-3.5" />}
                {v.type === "error" && <AlertTriangle className="w-3.5 h-3.5" />}
                {v.msg}
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      {edges.length === 0 && nodes.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg text-xs"
          style={{
            background: "oklch(0.6 0.15 270 / 0.08)",
            border: "1px solid oklch(0.6 0.15 270 / 0.2)",
            color: "oklch(0.6 0.15 270)",
          }}
        >
          <Info className="w-4 h-4 shrink-0" />
          <span>
            <strong>How to connect:</strong> Drag from the right-side dot (●) of one match to the left-side dot of another.
            The winner of the first match will advance to the second. <strong>Click any connection line to unlink it.</strong> Press Delete key to remove selected edges.
          </span>
        </motion.div>
      )}
    </div>
  );
}
