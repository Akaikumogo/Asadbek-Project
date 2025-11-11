# Reference Firmware Outline (ESP32)

## Responsibilities
- Wi‑Fi reconnect with exponential backoff
- MQTT reconnect and subscriptions
- Handle commands (set ON/OFF, switch roles, schedule_upsert)
- Execute schedules locally for offline resilience
- Poll sensors (flow rate, power/current via CT, water level) and publish telemetry
- Safety defaults on boot: pumps OFF unless schedule requires ON and safe

## Pseudocode
```
setup():
  load_config_from_flash()
  wifi_connect_with_backoff()
  mqtt_connect()
  mqtt_subscribe([
    "cmd/pump/{deviceId}/+/set",
    "cmd/pump/{deviceId}/switch_role",
    "cmd/pump/{deviceId}/schedule_upsert"
  ])
  start_scheduler_task()
  start_sensor_poll_task()

loop():
  maintain_wifi()
  maintain_mqtt()
  process_incoming_messages()
  execute_due_schedule()
  if (tick % 5s == 0) publish_status_and_net()
  if (tick % 10s == 0) publish_metrics()
```

## Message Handling
- On `set`: toggle relay; publish `ack/{correlationId}` or `nak/{correlationId}`
- On `switch_role`: update active role; publish ACK/NAK
- On `schedule_upsert`: validate and persist rules to flash; publish ACK/NAK

## Schedules
- Store as cron-like rules; compute next run
- While offline, continue schedule execution

## Telemetry Rates
- status: retain, on change and every 30s
- metrics: every 10s
- net: every 30s or on change


