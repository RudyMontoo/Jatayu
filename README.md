# Jatayu

# NOVA — Swarm Intelligence Search & Rescue

> **A multi-drone swarm simulation with MQTT mesh networking, distributed task allocation, and real-time dashboard.**

## Architecture

```
main.py                    ── Entry point. Spawns 8 drones + operator on mesh
config.py                  ── Shared constants: MQTT topics, grid dims, colours
mesh/                      ── M1: MQTT mesh networking layer
  nova_mesh.py               · MQTT wrapper (supports real broker + mock)
  nova_vertex.py             · VertexNode lifecycle manager
  drone_node.py              · Base DroneNode (heartbeat, peer monitor, ESTOP)
  routing_table.py           · Multi-hop pathfinding
  chaos_proxy.py             · Simulated packet loss & blackout zones
  test_mesh.py               · 17-test M1 mesh test suite
swarm/                     ── M2: Swarm intelligence
  auction_engine.py          · Distributed task allocation (leader + bids)
  leader_election.py         · Raft-lite leader election
  crdt_map.py                · Last-Writer-Wins CRDT for shared grid
  mission_config.py          · Mission types & configurations
simulation/                ── M3: Pygame visualization
  world_sim.py               · Main Pygame app (50×50 grid, sidebar, mission bar)
  sim_drone.py               · Drone rendering with trails & battery
integration/               ── Headless integration tests
  verify_integration.py      · Wire-test: mesh → sim data-flow
ws_bridge.py               ── WebSocket bridge: mesh → web dashboard
dashboard/                 ── React + TypeScript + Vite real-time dashboard
```

## Setup

```bash
# Install dependencies
source venv/bin/activate
pip install -r requirements.txt
cd dashboard && npm install && cd ..
```

## Run

### Full stack (Pygame + Dashboard)
```bash
# Terminal 1: Main simulation
source venv/bin/activate
python main.py

# Terminal 2: Dashboard
cd dashboard && npm run dev
```
The dashboard auto-connects to the WebSocket bridge at `ws://localhost:8765`.

### Tests
```bash
# Mesh test suite (17 tests)
cd mesh && python test_mesh.py

# Integration test (headless Pygame)
python integration/verify_integration.py
```

## Demo script

1. Run `python main.py` — 8 drones appear on the Pygame grid
2. Watch the sidebar event log for heartbeat/mission updates
3. Click mission buttons to change themes (SAR → Fire → Defense, etc.)
4. Press `K` to kill a drone (demo), `E` for emergency stop
5. Open `http://localhost:5173` for the web dashboard — shows live drone positions
6. Open a Mosquitto broker and set `mode="REAL"` in `main.py` for real network

## MQTT Topics

| Topic | Purpose |
|---|---|
| `nova/discovery` | Peer discovery (NOVA_HELLO / ACK) |
| `nova/heartbeat` | Periodic drone status |
| `nova/worldstate` | Grid cell state updates (CRDT) |
| `nova/tasks` | Task posting for auction |
| `nova/bids` | Scout bids on tasks |
| `nova/task_assigned` | Winner announcement |
| `nova/election` / `nova/election_vote` | Leader election |
| `nova/estop` | Emergency stop |
| `nova/mission` | Mission type changes |

## Demo commands (in Pygame)
- **K** — Kill `drone_3` (demo)
- **E** — Emergency stop all drones
- **Mission bar** (bottom) — Switch mission theme
- **Escape** — Quit

## Team
NOVA — Search & Rescue drone swarm simulation
