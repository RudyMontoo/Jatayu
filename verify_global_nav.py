# verify_global_nav.py - Integration test for Advanced Swarm Global Nav
import asyncio
import json
import time
from mesh.nova_mesh import NovaMesh
import config

async def main():
    print("--- STARTING GLOBAL NAV VERIFICATION ---")
    
    # 1. Initialize two drones at extreme distances
    d1 = NovaMesh("drone_1", "MOCK")
    d1.set_position(0, 0) # Delhi Center
    
    d2 = NovaMesh("drone_2", "MOCK")
    d2.set_position(5000, 5000) # 50km away (5000 units * 10m)
    
    await d1.start()
    await d2.start()
    
    print(f"[TEST] D1 at (0,0), D2 at (5000, 5000)")
    
    # 2. Verify that they CANNOT see each other's heartbeats (Range is 250m)
    # We'll use a callback to track this
    received_d2_at_d1 = False
    def on_heartbeat(topic, payload, sender):
        nonlocal received_d2_at_d1
        if sender == "drone_2":
            received_d2_at_d1 = True

    d1.subscribe(config.TOPIC_HEARTBEAT, on_heartbeat)
    
    # Send heartbeats
    await d2.publish(config.TOPIC_HEARTBEAT, {"x": 5000, "y": 5000, "battery": 100})
    await asyncio.sleep(0.5)
    
    if not received_d2_at_d1:
        print("[PASS] Drones correctly isolated by distance (MOCK mesh simulation works)")
    else:
        print("[FAIL] Drones could see each other across 50km!")
        return

    # 3. Move D2 closer to D1 (within range)
    print("[TEST] Moving D2 to (10, 10) - 100m away")
    d2.set_position(10, 10)
    await d2.publish(config.TOPIC_HEARTBEAT, {"x": 10, "y": 10, "battery": 99})
    await asyncio.sleep(0.5)
    
    if received_d2_at_d1:
        print("[PASS] Drones connected when in range")
    else:
        print("[FAIL] Drones still isolated after moving into range!")
        return

    # 4. Verify Sparse Worldstate
    print("[TEST] Sending global coordinate worldstate (100000, 100000)")
    received_ws = False
    def on_ws(topic, payload, sender):
        nonlocal received_ws
        if payload.get("cell") == [100000, 100000]:
            received_ws = True
            
    d1.subscribe(config.TOPIC_WORLDSTATE, on_ws)
    await d2.publish(config.TOPIC_WORLDSTATE, {"cell": [100000, 100000], "status": "searched"})
    await asyncio.sleep(0.5)
    
    if received_ws:
        print("[PASS] Infinite coordinates correctly transmitted across mesh")
    else:
        print("[FAIL] Worldstate at (100000, 100000) was lost or filtered")
        
    await d1.stop()
    await d2.stop()
    print("--- VERIFICATION COMPLETE ---")

if __name__ == "__main__":
    asyncio.run(main())
