import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ReactFlow, useNodesState, useEdgesState, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "framer-motion";
import { Network } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Custom Team Node
const TeamNode = ({ data }) => {
  const { team, isActive } = data;
  return (
    <div className={`relative flex flex-col items-center justify-center p-2 rounded-full border-2 bg-card/80 backdrop-blur-md transition-all duration-300 ${isActive ? 'scale-110 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] z-10' : 'border-border opacity-70 scale-90'}`}
         style={{ width: 80, height: 80 }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ring-1 ring-white/10 mb-1"
           style={{ backgroundColor: team?.color || "oklch(0.3 0.02 260)" }}>
        {team?.shortName || team?.name?.substring(0, 3).toUpperCase() || "?"}
      </div>
      <span className="text-[10px] font-bold text-foreground text-center leading-tight line-clamp-1 max-w-full px-1">
        {team?.name || "TBD"}
      </span>
    </div>
  );
};

const nodeTypes = { teamNode: TeamNode };

export default function LeagueNetworkGraph({ matches, teams }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  // Generate nodes in a circle and edges based on matches
  useEffect(() => {
    if (!teams || teams.length === 0) return;

    const radius = 250;
    const centerX = 400;
    const centerY = 300;
    const angleStep = (2 * Math.PI) / teams.length;

    const newNodes = teams.map((team, index) => {
      const angle = index * angleStep - Math.PI / 2; // Start from top
      const x = centerX + radius * Math.cos(angle) - 40; // Center offset
      const y = centerY + radius * Math.sin(angle) - 40;

      return {
        id: String(team._id || team.id),
        type: 'teamNode',
        position: { x, y },
        data: { team, isActive: hoveredNodeId === null || hoveredNodeId === String(team._id || team.id) },
        draggable: false, // Keep it fixed in circular layout
      };
    });

    const newEdges = [];
    if (matches) {
      matches.forEach((match, idx) => {
        const sourceId = String(match.teamA?._id || match.teamA);
        const targetId = String(match.teamB?._id || match.teamB);

        if (sourceId && targetId && sourceId !== targetId && sourceId !== "undefined" && targetId !== "undefined") {
          // Determine edge color based on status
          let edgeColor = "oklch(0.3 0.02 260)"; // Default
          let animated = false;
          let strokeWidth = 2;

          if (match.status === "completed") {
            edgeColor = "oklch(0.6 0.15 150)"; // Green
            strokeWidth = 3;
          } else if (match.status === "live") {
            edgeColor = "oklch(0.6 0.15 250)"; // Blue/Cyan
            animated = true;
            strokeWidth = 4;
          } else if (match.status === "upcoming") {
            edgeColor = "oklch(0.8 0.15 80)"; // Yellow/Orange
          }

          // If a node is hovered, highlight its edges and fade others
          let opacity = 1;
          if (hoveredNodeId) {
            if (sourceId !== hoveredNodeId && targetId !== hoveredNodeId) {
              opacity = 0.1;
            } else {
              strokeWidth += 2;
              opacity = 1;
            }
          }

          newEdges.push({
            id: `e-${sourceId}-${targetId}-${idx}`,
            source: sourceId,
            target: targetId,
            animated,
            style: { 
              stroke: edgeColor, 
              strokeWidth,
              opacity,
              transition: 'all 0.3s ease'
            },
            data: { match }
          });
        }
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [teams, matches, hoveredNodeId, setNodes, setEdges]);

  const onNodeMouseEnter = useCallback((_, node) => {
    setHoveredNodeId(node.id);
  }, []);

  const onNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  if (!teams || teams.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Network className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p className="font-medium">No teams available for network graph.</p>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border border-border bg-card">
      <CardContent className="p-0">
        <div style={{ width: '100%', height: '600px' }} className="bg-background/40 relative">
          
          <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-sm p-3 rounded-lg border border-border text-xs space-y-2 pointer-events-none">
            <h3 className="font-bold text-foreground mb-1 uppercase tracking-wider">Legend</h3>
            <div className="flex items-center gap-2"><div className="w-3 h-1 bg-emerald-500 rounded-full"></div> Completed</div>
            <div className="flex items-center gap-2"><div className="w-3 h-1 bg-blue-500 rounded-full animate-pulse"></div> Live</div>
            <div className="flex items-center gap-2"><div className="w-3 h-1 bg-yellow-500 rounded-full"></div> Upcoming</div>
            <div className="flex items-center gap-2"><div className="w-3 h-1 bg-muted-foreground rounded-full"></div> Unscheduled</div>
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeMouseEnter={onNodeMouseEnter}
            onNodeMouseLeave={onNodeMouseLeave}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.5}
            maxZoom={2}
          >
            <Background color="oklch(0.3 0.02 260 / 0.1)" gap={20} size={1} />
            <Controls className="fill-foreground bg-card border-border" />
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  );
}
