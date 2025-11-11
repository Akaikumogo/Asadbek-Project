# Smart Pump Control - MQTT Protocol

## Topics

- Telemetry:
  - `pump/{deviceId}/{pumpId}/status`
  - `pump/{deviceId}/{pumpId}/metrics` (water_flow_lpm, power_w, energy_kwh, runtime_s)
  - `device/{deviceId}/net` (wifi_ssid, rssi, ip, connected)
  - `device/{deviceId}/level` (water_depth_cm)
- Commands:
  - `cmd/pump/{deviceId}/{pumpId}/set` payload: `{ "on": boolean }`
  - `cmd/pump/{deviceId}/switch_role` payload: `{ "active": "PRIMARY"|"SECONDARY"|"PARALLEL" }`
  - `cmd/pump/{deviceId}/schedule_upsert` payload: `{ "rules": CronLike[] }`
- Acknowledgements:
  - Devices publish `ack/{correlationId}` or `nak/{correlationId}` with `{ "reason"?: string }`

## Payload Schemas

```json
// status
{ "on": true, "role": "PRIMARY", "mode": "Primary", "fault": false, "ts": 1731260000 }
```

```json
// metrics
{ "water_flow_lpm": 13.2, "power_w": 120.5, "energy_kwh": 0.033, "runtime_s": 3600, "ts": 1731260000 }
```

```json
// net
{ "wifi_ssid": "FarmAP", "rssi": -62, "ip": "192.168.1.44", "connected": true, "ts": 1731260000 }
```

```json
// level
{ "water_depth_cm": 185, "ts": 1731260000 }
```

```json
// schedule rule (CronLike)
{ "id":"rule-1", "cron":"0 6 * * 1-5", "enabled":true, "duration_s":1800, "pumpId":"pump-1" }
```

## QoS and Retain
- Telemetry: QoS 0-1, no retain
- Status: QoS 1, retain
- ACK/NAK: QoS 1, no retain

## Safety Defaults
- On boot: pumps OFF unless schedule demands ON and sensors indicate safe conditions.
- On MQTT disconnect: maintain last known schedule state; fail closed on faults.


