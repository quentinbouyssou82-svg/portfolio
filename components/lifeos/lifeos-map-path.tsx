"use client";

import { motion } from "framer-motion";
import { Crown, Flag, Lock, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { WORLDS } from "@/lib/lifeos/constants";
import type { MapNode } from "@/lib/lifeos/types";

function NodeIcon({ type, status }: { type: MapNode["type"]; status: MapNode["status"] }) {
  if (status === "locked") return <Lock className="size-4" />;
  if (type === "boss") return <Crown className="size-4" />;
  if (type === "checkpoint" || type === "milestone") return <Flag className="size-4" />;
  if (type === "side") return <Star className="size-4" />;
  return null;
}

export function LifeOSMapPath({ nodes, worldId }: { nodes: MapNode[]; worldId: string }) {
  const world = WORLDS.find((w) => w.id === worldId);
  const mainNodes = nodes.filter((n) => !n.sideBranch);
  const sideNodes = nodes.filter((n) => n.sideBranch);

  return (
    <div className="relative mx-auto max-w-sm py-8">
      <div className="mb-6 text-center">
        <span className="text-3xl">{world?.emoji}</span>
        <h2 className="mt-2 text-xl font-bold">{world?.name} World</h2>
        <p className="text-sm text-[var(--lifeos-muted)]">Level {world?.level}</p>
      </div>

      <div className="relative flex flex-col items-center gap-0">
        {[...mainNodes].reverse().map((node, i) => {
          const isActive = node.status === "active";
          const isComplete = node.status === "complete";
          const isBoss = node.type === "boss";
          const side = sideNodes.find((s) => s.level === node.level);

          return (
            <div key={node.id} className="relative flex w-full items-center justify-center">
              {side && (
                <motion.div
                  className={cn(
                    "absolute right-4 flex size-12 items-center justify-center rounded-full border-2 text-xs font-bold",
                    side.status === "complete"
                      ? "border-[var(--lifeos-gold)] bg-[#FEF3C7] text-[var(--lifeos-gold)]"
                      : "border-dashed border-[var(--lifeos-border)] bg-white text-[var(--lifeos-muted)]",
                  )}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Star className="size-4" />
                </motion.div>
              )}

              {i > 0 && (
                <div
                  className="absolute top-0 h-8 w-1 -translate-y-full rounded-full"
                  style={{
                    background: isComplete || isActive ? world?.color : "var(--lifeos-border)",
                  }}
                />
              )}

              <motion.div
                className={cn(
                  "relative z-10 my-2 flex flex-col items-center",
                  isActive && "lifeos-node-active",
                )}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
              >
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full border-4 font-bold shadow-md",
                    isBoss ? "size-16" : "size-14",
                    isActive && "ring-4 ring-offset-2",
                    node.status === "locked" && "border-[var(--lifeos-border)] bg-[#F5F5F4] text-[var(--lifeos-muted)]",
                    isComplete && "border-white text-white",
                    isActive && "border-white text-white",
                  )}
                  style={{
                    background:
                      isComplete || isActive ? world?.color : undefined,
                    ...(isActive ? { boxShadow: `0 0 0 4px ${world?.color}33` } : {}),
                  }}
                >
                  {node.status === "locked" ? (
                    <Lock className="size-5" />
                  ) : (
                    <NodeIcon type={node.type} status={node.status} />
                  )}
                </div>

                {isActive && (
                  <span className="mt-1 rounded-full bg-[var(--lifeos-purple)] px-2 py-0.5 text-[10px] font-bold text-white">
                    YOU
                  </span>
                )}

                <div
                  className={cn(
                    "lifeos-card mt-2 max-w-[200px] px-3 py-2 text-center",
                    isActive && "lifeos-hero-quest",
                  )}
                >
                  <p className="text-xs font-bold">{node.title}</p>
                  <p className="text-[10px] text-[var(--lifeos-muted)]">+{node.xp} XP</p>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
