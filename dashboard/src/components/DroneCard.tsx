import type { Drone } from "./types";

interface Props {
  drone: Drone;
}

export function DroneCard({ drone }: Props) {
  const isAlive = drone.alive;
  const isDec = drone.role === "decision";
  const color = isDec ? "#eab308" : "#3b82f6";
  const barColor =
    drone.battery < 25
      ? "#ef4444"
      : drone.battery < 55
      ? "#eab308"
      : "#22c55e";
  const barW = `${Math.min(drone.battery, 100)}%`;
  const isCrashed = drone.current_task === "💀 CRASHED";
  const taskColor =
    isCrashed
      ? "text-orange-400 font-bold"
      : drone.current_task === "STOPPED"
      ? "text-red-400"
      : drone.current_task === "IDLE"
      ? "text-slate-600"
      : drone.current_task?.startsWith("⚠")
      ? "text-yellow-400 animate-pulse"
      : "text-cyan-400";

  return (
    <div
      className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
        isCrashed
          ? "border-orange-700/50 bg-orange-950/20"
          : isAlive
          ? "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
          : "border-red-900/30 bg-red-950/10 opacity-60"
      }`}
    >
      {/* Row 1: status dot + name + battery */}
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            isAlive ? "bg-emerald-400 shadow-[0_0_6px_#4ade80]" : "bg-red-500"
          }`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            {isDec && <span className="text-[10px]" title="Leader">&#9813;</span>}
            <span
              className="text-xs font-bold font-mono"
              style={{ color: isAlive ? color : "#666" }}
            >
              {drone.id.replace("drone_", "Drone ")}
            </span>
          </div>
        </div>
        {/* Battery bar */}
        <div className="w-10 shrink-0">
          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: barW, backgroundColor: barColor }}
            />
          </div>
          <div className="text-[9px] text-slate-500 font-mono text-right">
            {Math.round(drone.battery)}%
          </div>
        </div>
      </div>

      {/* Row 2: current task */}
      <div className={`text-[9px] font-mono mt-1 truncate ${taskColor}`}>
        {drone.current_task || "IDLE"}
      </div>

      {/* Row 3: stats */}
      <div className="flex items-center justify-between mt-1">
        <span className="text-[9px] text-slate-500 font-mono">
          ({Math.round(drone.x)}, {Math.round(drone.y)})
        </span>
        <span className="text-[9px] font-bold text-emerald-500 font-mono">
          {drone.tasks_done ?? 0} cleared
        </span>
      </div>

      {/* Offline since */}
      {!isAlive && drone.offline_since && (
        <div className="text-[9px] text-red-400 font-mono mt-0.5">
          ⚠ offline since {drone.offline_since}
        </div>
      )}
    </div>
  );
}
